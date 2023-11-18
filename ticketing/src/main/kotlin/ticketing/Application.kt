package ticketing

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import ticketing.database.DatabaseFactory
import ticketing.plugins.*

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", watchPaths = listOf("classes"), module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    DatabaseFactory.init()
    configureSerialization()
    configureRouting()
}
