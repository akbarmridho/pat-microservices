package ticketing.utils

import kotlinx.serialization.Serializable

@Serializable
data class PayloadData<T>(val data: T)

@Serializable
data class MessageData<T>(val message: T)