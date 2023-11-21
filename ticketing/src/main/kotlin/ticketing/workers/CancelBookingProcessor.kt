package ticketing.workers

import com.rabbitmq.client.AMQP
import com.rabbitmq.client.Channel
import com.rabbitmq.client.DefaultConsumer
import com.rabbitmq.client.Envelope
import ticketing.database.MessagingFactory
import ticketing.service.BookingService
import java.io.IOException
import kotlin.jvm.Throws

class CancelBookingConsumer(channel: Channel) : DefaultConsumer(channel) {
    @Throws(IOException::class)
    override fun handleDelivery(
        consumerTag: String,
        envelope: Envelope,
        properties: AMQP.BasicProperties,
        body: ByteArray
    ) {
        val message = String(body, charset("UTF-8"))

        println(" [x] Received '$message'")

        channel.basicAck(envelope.deliveryTag, false)
    }
}

object CancelBookingProcessor {
    fun spawn() {
        val connection = MessagingFactory.getFactory().newConnection()
        val channel = connection.createChannel()

        val consumer = CancelBookingConsumer(channel)

        channel.basicConsume(BookingService.CANCEL_BOOKING_TASK_QUEUE, false, consumer)
    }
}