import { DataTypes } from "sequelize"
import sequelize from "../config/database.js"

const Ticket = sequelize.define("Ticket", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true 
    },
    topic: { 
        type: DataTypes.STRING,
        allowNull: false 
    },
    description: { 
        type: DataTypes.TEXT,
        allowNull: false 
    },
    status: {
        type: DataTypes.ENUM("Новое", "В работе", "Завершено", "Отменено"),
        defaultValue: "Новое",
    },
    solution: { 
        type: DataTypes.TEXT 
    },
    cancelReason: { 
        type: DataTypes.TEXT 
    },
    createdAt: { 
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW 
    },
})

export default Ticket