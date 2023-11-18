package ticketing.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.isNotNull
import org.jetbrains.exposed.sql.Table

@Serializable
enum class SeatStatus(val status: String) {
    Open("OPEN"),
    Ongoing("ONGOING"),
    Booked("BOOKED")
}

data class Seat(val id: Int, val eventId: Int, val seatNumber: Int, val status: SeatStatus)

object Seats : Table() {
    val id = integer("id").autoIncrement()
    val eventId = reference("event_id", Events.id).isNotNull()
    val seatNumber = integer("seat_number").isNotNull()
    val status = enumerationByName("status", 10, SeatStatus::class).default(SeatStatus.Open).isNotNull()

    override val primaryKey = PrimaryKey(id)
}