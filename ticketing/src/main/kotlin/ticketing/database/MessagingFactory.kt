package ticketing.database

import com.rabbitmq.client.ConnectionFactory
import ticketing.config.config.rmqHost
import ticketing.service.BookingService

object MessagingFactory {
    private val connectionFactory: ConnectionFactory = ConnectionFactory()

    init {
        connectionFactory.host = rmqHost
    }

    fun getFactory(): ConnectionFactory {
        return connectionFactory
    }

    fun queueDeclare() {
        val connection = getFactory().newConnection()
        
        val cancelationChannel = connection.createChannel()
        cancelationChannel.queueDeclare(
            BookingService.CANCEL_BOOKING_TASK_QUEUE,
            true,
            false,
            false,
            null
        )

        cancelationChannel.close()
    }
}