package ticketing.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable


enum class SeatStatus(val status: String) {
    Open("OPEN"),
    Ongoing("ONGOING"),
    Booked("BOOKED")
}

@Serializable
data class Seat(val id: Int, val seatNumber: Int, val status: SeatStatus)

object Seats : IntIdTable() {
    val event = reference("event_id", Events)
    val seatNumber = integer("seat_number")
    val status = enumerationByName("status", 10, SeatStatus::class).default(SeatStatus.Open)
}

class SeatDao(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<SeatDao>(Seats)

    var seatNumber by Seats.seatNumber
    var status by Seats.status
    var event by EventDao referencedOn Seats.event

    fun toModel(): Seat {
        return Seat(id.value, seatNumber, status)
    }
}