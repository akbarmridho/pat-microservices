package ticketing.handlers

import io.ktor.http.*
import io.ktor.resources.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.resources.post
import ticketing.dto.CreateBookingRequest
import ticketing.dto.PaymentConfirmRequest
import ticketing.service.BookingService
import ticketing.service.FailedToGeneratePaymentException
import ticketing.utils.MessageData
import ticketing.utils.PayloadData

@Resource("/bookings")
class BookingRoute {

    @Resource("webhook")
    class Webhook(val parent: BookingRoute = BookingRoute())
}

fun Route.bookings(bookingService: BookingService) {
    post<BookingRoute> {
        val payload = call.receive<CreateBookingRequest>()

        val random = Math.random()

        if (random <= 0.2) {
            call.respond(HttpStatusCode.InternalServerError, MessageData("Cannot create booking for this seat"))
        } else {

            try {
                val result = bookingService.create(payload)
                call.respond(PayloadData(result))
            } catch (e: FailedToGeneratePaymentException) {
                call.respond(HttpStatusCode.InternalServerError, MessageData("Cannot create booking for this seat"))
            }
        }
    }

    post<BookingRoute.Webhook> {
        val payload = call.receive<PaymentConfirmRequest>()

        bookingService.confirm(payload)

        call.respond(MessageData("Ok"))
    }
}