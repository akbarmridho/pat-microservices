package ticketing.models

import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.dao.IntEntity
import org.jetbrains.exposed.dao.IntEntityClass
import org.jetbrains.exposed.dao.id.EntityID
import org.jetbrains.exposed.dao.id.IntIdTable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.isNotNull
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.CurrentDateTime
import org.jetbrains.exposed.sql.kotlin.datetime.CurrentTimestamp
import org.jetbrains.exposed.sql.kotlin.datetime.date
import org.jetbrains.exposed.sql.kotlin.datetime.datetime

enum class BookingStatus(val status: String) {
    InProcess("IN_PROCESS"),
    Queued("QUEUED"),
    Success("SUCCESS"),
    Failed("FAILED")
}


@Serializable
data class Booking(
    val id: Int,
    val seat: Seat,
    val status: BookingStatus,
    val failReason: String?,
    val invoiceId: String?,
    val paymentUrl: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

object Bookings : IntIdTable() {
    val seat = reference("seat_id", Seats)
    val status = enumerationByName("status", 20, BookingStatus::class).default(BookingStatus.InProcess).index()

    val failReason = text("fail_reason").nullable()
    val invoiceId = text("invoice_id").nullable()
    val paymentUrl = text("payment_url").nullable()

    val createdAt = datetime("created_at").defaultExpression(CurrentDateTime)
    val updateAt = datetime("updated_at").defaultExpression(CurrentDateTime)
}

class BookingDao(id: EntityID<Int>) : IntEntity(id) {
    companion object : IntEntityClass<BookingDao>(Bookings)

    var status by Bookings.status
    var failReason by Bookings.failReason
    var invoiceId by Bookings.invoiceId
    var paymentUrl by Bookings.paymentUrl
    var createAt by Bookings.createdAt
    var updatedAt by Bookings.updateAt

    var seat by SeatDao referencedOn Bookings.seat

    fun toModel(): Booking {
        return Booking(
            id.value,
            seat.toModel(),
            status,
            failReason,
            invoiceId,
            paymentUrl,
            createAt,
            updatedAt
        )
    }
}