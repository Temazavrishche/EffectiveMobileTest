import express from 'express'
import 'dotenv/config'
import sequelize from "./src/config/database.js"
import ticketRoutes from "./src/routes/ticketRoutes.js"
const app = express()

app.use(express.json())
app.use("/tickets", ticketRoutes)


const PORT = 3000
sequelize.sync().then(() => {
    console.log("БД синхронизирована")
    app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`))
}).catch((err) => console.error("Ошибка подключения к БД:", err))

export default app