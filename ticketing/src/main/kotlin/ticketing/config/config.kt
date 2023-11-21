package ticketing.config

object config {
    const val driverClassName = "org.postgresql.Driver"
    const val jdbcUrl = "jdbc:postgresql://localhost:5433/ticketing"
    const val dbUsername = "postgres"
    const val dbPassword = "pgpassword"

    const val rmqHost = "localhost"
    const val paymentServiceEndpoint = "http://localhost:8080"
}