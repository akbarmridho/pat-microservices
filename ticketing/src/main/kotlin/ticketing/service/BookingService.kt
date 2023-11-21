package ticketing.service

import com.rabbitmq.client.Channel
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.jetbrains.exposed.sql.transactions.TransactionManager
import ticketing.config.config.paymentServiceEndpoint
import ticketing.dto.CreateBookingRequest
import ticketing.database.DatabaseFactory.dbQuery
import ticketing.database.MessagingFactory
import ticketing.dto.PaymentRequest
import ticketing.models.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.serialization.kotlinx.json.*
import ticketing.dto.PaymentResponse

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

//    private fun dispatchBookingTask(bookingId: Int) {
//        bookingChannel.basicPublish(
//            "",
//            BOOKING_TASK_QUEUE,
//            MessageProperties.PERSISTENT_TEXT_PLAIN,
//            bookingId.toString().toByteArray(charset("UTF-8"))
//        )
//    }

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

    suspend fun create(payload: CreateBookingRequest): Booking = dbQuery {
        val reservedSeat = SeatDao[payload.id]

        when (reservedSeat.status) {
            SeatStatus.Open -> {
                val booking = BookingDao.new {
                    seat = reservedSeat
                    status = BookingStatus.InProcess
                }

                try {
                    val payment = generatePayment(booking)

                    booking.paymentUrl = payment.paymentUrl
                    booking.invoiceId = payment.invoiceId

                    booking.seat.status = SeatStatus.Ongoing

                    booking.toModel()
                } catch (e: FailedToGeneratePaymentException) {
                    TransactionManager.current().rollback()
                    throw e
                }
            }

            else -> {
                val booking = BookingDao.new {
                    seat = reservedSeat
                    status = BookingStatus.Queued
                }

                booking.toModel()
            }
        }
    }
}