package ticketing.database

import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import ticketing.models.Bookings
import ticketing.models.Events
import ticketing.models.Seats

object DatabaseFactory {
    fun init() {
        val driverClassName = "org.postgresql.Driver"
        val jdbcUrl = "jdbc:postgresql://localhost:5433/postgres"

        Database.connect(jdbcUrl, driverClassName, user = "postgres", password = "pgpassword")

        transaction {
            SchemaUtils.create(Events)
            SchemaUtils.create(Seats)
            SchemaUtils.create(Bookings)
        }
    }

    suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction(Dispatchers.IO) { block() }
}