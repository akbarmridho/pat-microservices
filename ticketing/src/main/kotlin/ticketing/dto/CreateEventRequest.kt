package ticketing.dto

import kotlinx.serialization.Serializable

@Serializable
data class CreateEventRequest(val title: String, val description: String, val price: Int, val seatCount: Int) {
    init {
        require(price > 0) {
            "Price must be greater than one"
        }
        require(seatCount > 0) {
            "Seat count must be greater than one"
        }
    }
}