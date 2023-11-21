package ticketing.handlers

import io.ktor.http.*
import io.ktor.resources.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import ticketing.dto.CreateBookingRequest
import ticketing.service.BookingService
import ticketing.utils.MessageData
import ticketing.utils.PayloadData

@Resource("bookings")
class BookingRoute {
}

fun Route.bookings(bookingService: BookingService) {
    post<BookingRoute> {
        val payload = call.receive<CreateBookingRequest>()

        val random = Math.random()

        if (random <= 0.2) {
            call.respond(HttpStatusCode.InternalServerError, MessageData("Cannot create booking for this seat"))
        } else {
            val result = bookingService.create(payload)
            call.respond(PayloadData(result))
        }
    }
}