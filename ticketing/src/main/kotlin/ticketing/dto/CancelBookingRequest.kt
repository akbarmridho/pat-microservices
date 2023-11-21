package ticketing.dto

import kotlinx.serialization.Serializable

@Serializable
data class CancelBookingRequest(val id: Int)