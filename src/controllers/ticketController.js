import Ticket from "../models/Ticket.js"
import { Op } from "sequelize"

export default {
    async createTicket(req, res) {
        try {
            const { topic, description } = req.body

            if(!topic || !description) {
                res.status(400).json({error: "Тема и описание обязательны"})
                return
            }
            
            const ticket = await Ticket.create({ topic, description })
            res.status(200).json(ticket)
        } catch (error) {
            console.error(error)
            res.status(500).json({ error: "Ошибка при создании обращения" })
        }
    },

    async takeInWork(req, res) {
        try {
            const ticket = await Ticket.findByPk(req.params.id)
            if (!ticket) return res.status(404).json({ error: "Обращение не найдено" })

            if (ticket.status !== "Новое") return res.status(400).json({ error: "Обращение уже в работе или завершено" })

            ticket.status = "В работе"
            await ticket.save()
            res.status(200).json(ticket)
        } catch (error) {
            res.status(500).json({ error: "Ошибка при обновлении статуса" })
        }
    },

    async completeTicket(req, res) {
        try {
            const { solution } = req.body
            const ticket = await Ticket.findByPk(req.params.id)
            if (!ticket) return res.status(404).json({ error: "Обращение не найдено" })

            if (ticket.status !== "В работе") return res.status(400).json({ error: "Обращение не в работе или завершено" })

            ticket.status = "Завершено"
            ticket.solution = solution
            await ticket.save()
            res.status(200).json(ticket)
        } catch (error) {
            res.status(500).json({ error: "Ошибка при завершении обращения" })
        }
    },

    async cancelTicket(req, res) {
        try {
            const { cancelReason } = req.body
            const ticket = await Ticket.findByPk(req.params.id)
            if (!ticket) return res.status(404).json({ error: "Обращение не найдено" })

            ticket.status = "Отменено"
            ticket.cancelReason = cancelReason
            await ticket.save()
            res.status(200).json(ticket)
        } catch (error) {
            res.status(500).json({ error: "Ошибка при отмене обращения" })
        }
    },

    async getTickets(req, res) {
        try {
            const { date, startDate, endDate } = req.query
            let where = {};

            if (date) where.createdAt = new Date(date)
            if (startDate && endDate) where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] }

            const tickets = await Ticket.findAll({ where })
            res.status(200).json(tickets)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Ошибка при получении обращений" })
        }
    },

    async cancelAllInWork(req, res) {
        try {
            const tickets = await Ticket.update(
                { status: "Отменено" },
                { where: { status: "В работе" } }
            )
            console.log(tickets)
            res.status(200).json({ message: `Отменено ${tickets[0]} обращений` })
        } catch (error) {
            res.status(500).json({ error: "Ошибка при отмене обращений" })
        }
    },
}