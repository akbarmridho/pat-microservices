package ticketing.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateBookingRequest(val id: Int) {
    init {
        require(id > 0) {
            "Id must be greater than one"
        }
    }
}