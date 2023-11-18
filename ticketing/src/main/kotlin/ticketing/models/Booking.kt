package ticketing.models

import kotlinx.serialization.Serializable
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
    val seatId: Int,
    val status: BookingStatus,
    val failReason: String?,
    val invoiceId: String?,
    val paymentUrl: String?
)

object Bookings : Table() {
    val id = integer("id").autoIncrement()
    val seatId = reference("seat_id", Seats.id).isNotNull()
    val status = enumerationByName("status", 20, BookingStatus::class).default(BookingStatus.InProcess).index()

    val failReason = text("fail_reason")
    val invoiceId = text("invoice_id")
    val paymentUrl = text("payment_url")

    val createdAt = datetime("created_at").defaultExpression(CurrentDateTime).isNotNull()
    val updateAt = datetime("updated_at").defaultExpression(CurrentDateTime).isNotNull()

    override val primaryKey = PrimaryKey(id)
}

