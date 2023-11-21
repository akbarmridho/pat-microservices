package ticketing.handlers

import io.ktor.resources.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.resources.*
import io.ktor.server.resources.post
import io.ktor.server.response.*
import io.ktor.server.routing.*
import ticketing.service.EventService
import ticketing.dto.CreateEventRequest
import ticketing.utils.PayloadData

@Resource("/events")
class EventsRoute {

    @Resource("{id}")
    class Id(val parent: EventsRoute = EventsRoute(), val id: Int)
}


fun Route.events(eventService: EventService) {
    get<EventsRoute> {
        val payload = eventService.getAll()

        call.respond(PayloadData(payload))
    }

    get<EventsRoute.Id> { event ->
        val id = event.id

        val payload = eventService.find(id)

        call.respond(PayloadData(payload))
    }

    post<EventsRoute> {
        val payload = call.receive<CreateEventRequest>()
        val result = eventService.create(payload)
        call.respond(PayloadData(result))
    }
}