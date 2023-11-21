package ticketing.dto

import kotlinx.serialization.Serializable

@Serializable
data class PaymentResponse(val invoiceId: String, val paymentUrl: String)