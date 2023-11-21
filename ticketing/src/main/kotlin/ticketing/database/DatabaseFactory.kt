package ticketing.database

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction
import ticketing.config.config
import ticketing.config.config.dbPassword
import ticketing.config.config.dbUsername
import ticketing.config.config.driverClassName
import ticketing.config.config.jdbcUrl
import ticketing.models.Bookings
import ticketing.models.Events
import ticketing.models.Seats

object DatabaseFactory {
    fun init() {
        Database.connect(createHikariDataSource())

        transaction {
            SchemaUtils.create(Events)
            SchemaUtils.create(Seats)
            SchemaUtils.create(Bookings)
        }
    }

    private fun createHikariDataSource() = HikariDataSource(HikariConfig().apply {
        driverClassName = config.driverClassName
        jdbcUrl = config.jdbcUrl
        maximumPoolSize = 4
        isAutoCommit = false
        transactionIsolation = "TRANSACTION_REPEATABLE_READ"
        username = dbUsername
        password = dbPassword
        validate()
    })

    suspend fun <T> dbQuery(block: suspend () -> T): T = newSuspendedTransaction(Dispatchers.IO) { block() }
}