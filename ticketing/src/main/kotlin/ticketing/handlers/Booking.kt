package ticketing.handlers

import com.lowagie.text.Document
import com.lowagie.text.Paragraph
import com.lowagie.text.pdf.PdfWriter
import io.ktor.http.*
import io.ktor.resources.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.resources.post
import io.ktor.server.resources.get
import ticketing.dto.CancelBookingRequest
import ticketing.dto.CreateBookingRequest
import ticketing.dto.PaymentConfirmRequest
import ticketing.service.BookingService
import ticketing.service.EventService
import ticketing.service.FailedToGeneratePaymentException
import ticketing.utils.MessageData
import ticketing.utils.PayloadData
import java.io.ByteArrayOutputStream

@Resource("/bookings")
class BookingRoute {

    @Resource("webhook")
    class Webhook(val parent: BookingRoute = BookingRoute())

    @Resource("cancel")
    class Cancel(val parent: BookingRoute = BookingRoute())

    @Resource("{id}")
    class Id(val parent: BookingRoute = BookingRoute(), val id: Int)

    @Resource("{id}/print")
    class Print(val parent: BookingRoute = BookingRoute(), val id: Int)
}

fun Route.bookings(bookingService: BookingService, eventService: EventService) {
    post<BookingRoute> {
        val payload = call.receive<CreateBookingRequest>()

        val random = Math.random()

        if (random <= 0.2) {
            call.respond(HttpStatusCode.InternalServerError, MessageData("Cannot create booking for this seat"))
        } else {

            try {
                val createdBooking = bookingService.create(payload)
                val result = bookingService.processNewQueue(createdBooking.id)
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

    post<BookingRoute.Cancel> {
        val payload = call.receive<CancelBookingRequest>()

        bookingService.cancel(payload)

        call.respond(MessageData("Ok"))
    }

    get<BookingRoute.Id> { booking ->
        val id = booking.id

        val payload = bookingService.find(id)

        call.respond(PayloadData(payload))
    }

    get<BookingRoute.Print> { booking ->
        val id = booking.id

        val payload = bookingService.find(id)
        val event = eventService.find(payload.seat.eventId)

        val document = Document()

        call.respondOutputStream(producer = {
            PdfWriter.getInstance(document, this)

            document.open()
            document.add(Paragraph("Booking #${payload.id}"))
            document.add(Paragraph("Status ${payload.status}"))

            if (payload.failReason != null && payload.failReason != "") {
                document.add(Paragraph("Fail reason ${payload.failReason}"))
            }

            if (payload.invoiceId != null) {
                document.add(Paragraph("Invoice #${payload.invoiceId} with total Rp${event.price}"))
            }

            if (payload.paymentUrl != null) {
                document.add(Paragraph("Payment Url ${payload.paymentUrl}"))
            }

            document.add(Paragraph("Event ${event.title} seat number ${payload.seat.seatNumber}"))

            document.add(Paragraph("Created at ${payload.createdAt} and last updated at ${payload.updatedAt}"))

            document.close()
        }, contentType = ContentType.Application.Pdf)
    }
}