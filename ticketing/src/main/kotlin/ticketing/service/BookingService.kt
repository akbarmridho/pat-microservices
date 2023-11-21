package ticketing.service

import ticketing.dto.CreateBookingRequest
import ticketing.database.DatabaseFactory.dbQuery
import ticketing.models.*

class BookingService {
    suspend fun create(payload: CreateBookingRequest): Booking = dbQuery {
        val reservedSeat = SeatDao[payload.id]

        when (reservedSeat.status) {
            SeatStatus.Open -> {
                val booking = BookingDao.new {
                    seat = reservedSeat
                    status = BookingStatus.InProcess
                }

                booking.toModel()
            }

            else -> {
                val booking = BookingDao.new {
                    seat = reservedSeat
                    status = BookingStatus.Queued
                }

                booking.toModel()
            }
        }
    }
}