package ticketing.database

import ticketing.database.DatabaseFactory.dbQuery
import ticketing.models.Event
import ticketing.models.EventDao

class EventService {
    suspend fun getAllEvents(): List<Event> = dbQuery {
        EventDao.all().map { it.toModel() }
    }
}