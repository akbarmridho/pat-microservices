package ticketing.config

object config {
    const val driverClassName = "org.postgresql.Driver"
    var jdbcUrl = System.getenv("JDBC_URL") ?: "jdbc:postgresql://localhost:5433/ticketing"
    var dbUsername = System.getenv("JDBC_USERNAME") ?: "postgres"
    var dbPassword = System.getenv("JDBC_PASSWORD") ?: "pgpassword"

    var rmqHost = System.getenv("RMQ_HOST") ?: "localhost"
    var paymentServiceEndpoint = System.getenv("PAYMENT_SERVICE_ENDPOINT") ?: "http://localhost:8080"
}