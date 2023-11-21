package ticketing.service

import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.batchInsert
import ticketing.database.DatabaseFactory.dbQuery
import ticketing.dto.CreateEventRequest
import ticketing.models.*


class EventService {
    suspend fun getAll(): List<Event> = dbQuery {
        EventDao.all().map { it.toModel() }
    }

    suspend fun find(id: Int): Event = dbQuery {
        val event = EventDao[id].toModel()
        event.seats = SeatDao.find(Seats.event eq id).map { it.toModel() }

        event
    }

    suspend fun create(payload: CreateEventRequest): Event = dbQuery {
        val eventDao = EventDao.new {
            title = payload.title
            description = payload.description
            price = payload.price
        }

        val seatsNumber = mutableListOf<Int>()

        for (i in 1..payload.seatCount) {
            seatsNumber.add(i)
        }

        Seats.batchInsert(seatsNumber) { seatNumber ->
            this[Seats.event] = eventDao.id
            this[Seats.seatNumber] = seatNumber
        }

        val event = eventDao.toModel()

        event.seats = SeatDao.find(Seats.event eq event.id).map { it.toModel() }

        event
    }

}