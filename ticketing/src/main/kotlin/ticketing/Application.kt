package ticketing

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.requestvalidation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.resources.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.dao.exceptions.EntityNotFoundException
import ticketing.database.DatabaseFactory
import ticketing.handlers.bookings
import ticketing.service.EventService
import ticketing.handlers.events
import ticketing.service.BookingService

fun main() {
    val nCores = 4

    embeddedServer(Netty,
        port = 8080,
        host = "0.0.0.0",
        watchPaths = listOf("classes"),
        module = Application::module,
        configure = {
            // Specifies the minimum size of a thread pool used to process application calls
            callGroupSize = nCores
            // Specifies how many threads are used to accept new connections and start call processing
            connectionGroupSize = nCores / 2
            // Specifies size of the event group for processing connections, parsing messages and doing engine's internal work
            workerGroupSize = nCores / 2
        }
    )
        .start(wait = true)
}

fun Application.module() {
    DatabaseFactory.init()

    install(ContentNegotiation) {
        json()
    }

    install(RequestValidation)

    install(Resources)

    install(StatusPages) {
        exception<Throwable> { call, cause ->
            when (cause) {
                is EntityNotFoundException -> {
                    call.respondText(text = "Resource not found", status = HttpStatusCode.NotFound)
                }

                is RequestValidationException -> {
                    call.respond(HttpStatusCode.BadRequest, cause.reasons)
                }

                else -> {
                    call.respondText(text = "500: $cause", status = HttpStatusCode.InternalServerError)
                }
            }
        }
    }

    val eventService = EventService()
    val bookingService = BookingService()

    routing {
        get("/") {
            call.respondText("Hello World!")
        }

        events(eventService)
        bookings(bookingService)
    }
}
