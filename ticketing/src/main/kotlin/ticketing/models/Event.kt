package ticketing.models

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.sql.SqlExpressionBuilder.isNotNull
import org.jetbrains.exposed.sql.Table

@Serializable
data class Event(val id: Int, val name: String, val description: String)

object Events : Table() {
    val id = integer("id").autoIncrement()
    val title = varchar("title", 255).isNotNull()
    val description = varchar("description", 1024).isNotNull()
    val price = integer("price").isNotNull()

    override val primaryKey = PrimaryKey(id)
}
