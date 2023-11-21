package ticketing.service

import com.rabbitmq.client.Channel
import com.rabbitmq.client.MessageProperties
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.jetbrains.exposed.sql.transactions.TransactionManager
import ticketing.config.config.paymentServiceEndpoint
import ticketing.database.DatabaseFactory.dbQuery
import ticketing.database.MessagingFactory
import ticketing.models.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.update
import ticketing.dto.*

class FailedToGeneratePaymentException : Exception()

class BookingService {
    private val cancelationChannel: Channel
    private val client = HttpClient {
        install(ContentNegotiation) {
            json()
        }
    }

    companion object {
        const val CANCEL_BOOKING_TASK_QUEUE = "cancel_booking_task_queue"
    }

    init {
        val connection = MessagingFactory.getFactory().newConnection()

        this.cancelationChannel = connection.createChannel()
        cancelationChannel.queueDeclare(
            CANCEL_BOOKING_TASK_QUEUE,
            true,
            false,
            false,
            null
        )
    }

    private fun dispatchFailedBookingTask(seatId: Int) {
        cancelationChannel.basicPublish(
            "",
            CANCEL_BOOKING_TASK_QUEUE,
            MessageProperties.PERSISTENT_TEXT_PLAIN,
            seatId.toString().toByteArray(charset("UTF-8"))
        )
    }

    private suspend fun generatePayment(booking: BookingDao): PaymentResponse {
        try {
            val response = client.post(paymentServiceEndpoint) {
                contentType(ContentType.Application.Json)
                setBody(PaymentRequest(booking.seat.event.price))
                expectSuccess = true
            }

            return response.body<PaymentResponse>()
        } catch (e: Exception) {
            throw FailedToGeneratePaymentException()
        }
    }

    suspend fun cancel(payload: CancelBookingRequest) = dbQuery {
        val booking = BookingDao[payload.id]

        if (booking.status != BookingStatus.Failed) {
            // if status is in process or success
            if (booking.status != BookingStatus.Queued) {
                booking.seat.status = SeatStatus.Open
                dispatchFailedBookingTask(booking.seat.id.value)
            }

            booking.status = BookingStatus.Failed
            booking.failReason = "Cancelled by user"
        }
    }

    suspend fun confirm(payload: PaymentConfirmRequest) = dbQuery {
        val booking = BookingDao.find(Bookings.invoiceId eq payload.invoiceId).limit(1).firstOrNull()

        if (booking != null && booking.status == BookingStatus.InProcess) {
            if (payload.status == "success") {
                booking.status = BookingStatus.Success
                booking.seat.status = SeatStatus.Booked
            } else {
                booking.status = BookingStatus.Failed
                booking.seat.status = SeatStatus.Open
                booking.failReason = payload.failReason
                dispatchFailedBookingTask(booking.seat.id.value)
            }
        }
    }

    suspend fun processQueueFromCancel(seatId: Int) = dbQuery {
        val booking = BookingDao.find {
            (Bookings.seat eq seatId) and (Bookings.status eq BookingStatus.Queued)
        }.limit(1).firstOrNull()

        if (booking != null) {
            processQueue(booking)
        }
    }

    private suspend fun processQueue(booking: BookingDao) {
        if (booking.seat.status == SeatStatus.Open) {
            try {
                val payment = generatePayment(booking)

                booking.status = BookingStatus.InProcess
                booking.paymentUrl = payment.paymentUrl
                booking.invoiceId = payment.invoiceId

                booking.seat.status = SeatStatus.Ongoing
            } catch (e: FailedToGeneratePaymentException) {
                TransactionManager.current().rollback()
                throw e
            }
        }
    }

    suspend fun create(payload: CreateBookingRequest): Booking = dbQuery {
        val reservedSeat = SeatDao[payload.id]

        val booking = BookingDao.new {
            seat = reservedSeat
            status = BookingStatus.Queued
        }

        processQueue(booking)

        booking.toModel()
    }
}