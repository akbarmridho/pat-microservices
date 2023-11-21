package ticketing.dto

import kotlinx.serialization.Serializable

@Serializable
data class PaymentConfirmRequest(val invoiceId: String, val status: String, val failReason: String? = null)