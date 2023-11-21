package ticketing.dto

import kotlinx.serialization.Serializable

@Serializable
data class PaymentRequest(val amount: Int)