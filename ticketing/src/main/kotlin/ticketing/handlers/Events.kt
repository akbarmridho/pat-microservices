package ticketing.handlers

import io.ktor.resources.*
import io.ktor.server.application.*
import io.ktor.server.resources.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import ticketing.database.EventService
import ticketing.models.EventDao

@Resource("events")
class Events {

    @Resource("{id}")
    class Id(val parent: Events = Events(), val id: Int)
}

fun Route.events(eventService: EventService) {
    get<Events> {
        val payload = eventService.getAllEvents()

        call.respond(payload)
    }
}