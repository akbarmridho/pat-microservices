package ticketing

import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
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
import ticketing.database.EventService
import ticketing.handlers.events

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", watchPaths = listOf("classes"), module = Application::module)
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

    routing {
        get("/") {
            call.respondText("Hello World!")
        }

        events(eventService)
    }
}
