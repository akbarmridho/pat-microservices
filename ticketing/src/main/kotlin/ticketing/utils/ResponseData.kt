package ticketing.utils

import kotlinx.serialization.Serializable

@Serializable
data class PayloadData<T>(val data: T)