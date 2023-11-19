package ticketing.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable

@Serializable
data class Event(val id: Int, val title: String, val description: String, val price: Int, var seats: List<Seat>? = null)


object Events : IntIdTable() {
    val title = varchar("title", 255)
    val description = varchar("description", 1024)
    val price = integer("price")
}

class EventDao(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<EventDao>(Events)

    var title by Events.title
    var description by Events.description
    var price by Events.price

    fun toModel(): Event {
        return Event(id.value, title, description, price)
    }
}