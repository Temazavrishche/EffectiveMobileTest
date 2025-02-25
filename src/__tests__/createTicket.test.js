import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../app.js'
import sequelize from '../config/database'
import Ticket from '../models/Ticket.js'

const ticketData = {
  topic: 'Тема обращения',
  description: 'Описание обращения'
}

describe('POST /tickets/create', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true })
  })

  it('Создать новое обращение и вернуть его данные', async () => {

    const response = await request(app).post('/tickets/create').send(ticketData)
    
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('topic', ticketData.topic)
    expect(response.body).toHaveProperty('description', ticketData.description)
    expect(response.body).toHaveProperty('status', 'Новое')
  })

  it('Вернуть ошибку, если данные не указаны', async () => {
    const response = await request(app).post('/tickets/create').send({})

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error', 'Тема и описание обязательны')
  })
})


describe('PUT /tickets/:id/work', async () => {
  let ticket
  beforeAll(async () => {
    await sequelize.sync({ force: true })
    ticket = await Ticket.create(ticketData)
  })

  it('Вернуть ошибку тк тикета не существует', async () => {
    const response = await request(app).put('/tickets/999/work')
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error', 'Обращение не найдено')
  })

  it('Поменять статус на "В работе" и вернуть тикет', async () => {
    const response = await request(app).put(`/tickets/${ticket.id}/work`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('topic', ticket.topic)
    expect(response.body).toHaveProperty('description', ticket.description)
    expect(response.body).toHaveProperty('status', 'В работе')
  })

  it('Тикет уже в работе, или завершен', async () => {
    const response = await request(app).put(`/tickets/${ticket.id}/work`)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error', 'Обращение уже в работе или завершено')
  })
})

describe('PUT /tickets/:id/complete', async () => {
  let ticket
  beforeAll(async () => {
    await sequelize.sync({ force: true })
    ticket = await Ticket.create(ticketData)
  })

  it('Вернуть ошибку тк тикета не существует', async () => {
    const response = await request(app).put('/tickets/999/complete')
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error', 'Обращение не найдено')
  })

  it('Тикет не в работе или завершено', async () => {
    const response = await request(app).put(`/tickets/${ticket.id}/complete`)

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty('error', 'Обращение не в работе или завершено')
  })

  it('Поменять статус на "Завершено" и вернуть тикет', async () => {

    await ticket.update({status: 'В работе'})
    const response = await request(app).put(`/tickets/${ticket.id}/complete`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('topic', ticket.topic)
    expect(response.body).toHaveProperty('description', ticket.description)
    expect(response.body).toHaveProperty('status', 'Завершено')
  })

})

describe('PUT /tickets/:id/cancel', async () => {
  let ticket
  beforeAll(async () => {
    await sequelize.sync({ force: true })
    ticket = await Ticket.create(ticketData)
  })

  it('Тикет не найден', async () => {
    const response = await request(app).put('/tickets/999/cancel')
    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('error', 'Обращение не найдено')
  })

  it('Поменять статус на "Отменено" и вернуть тикет', async () => {
    const response = await request(app).put(`/tickets/${ticket.id}/cancel`)
    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('topic', ticket.topic)
    expect(response.body).toHaveProperty('description', ticket.description)
    expect(response.body).toHaveProperty('status', 'Отменено')
  })
})
describe('GET /tickets', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true })
    
    await Ticket.bulkCreate([
      { topic: 'Ticket 1', description: 'Desc 1', createdAt: new Date('2024-02-20') },
      { topic: 'Ticket 2', description: 'Desc 2', createdAt: new Date('2024-02-21') },
      { topic: 'Ticket 3', description: 'Desc 3', createdAt: new Date('2024-02-22') }
    ])
  })

  it('Вернуть все тикеты', async () => {
    const response = await request(app).get('/tickets');
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(3)
  });

  it('Вернуть тикеты за конкретную дату', async () => {
    const response = await request(app).get('/tickets?date=2024-02-21')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
    expect(response.body[0].topic).toBe('Ticket 2')
  });

  it('Вернуть тикеты за диапазон дат', async () => {
    const response = await request(app).get('/tickets?startDate=2024-02-20&endDate=2024-02-21')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(2)
  });

  it('Вернуть пустой массив, если тикетов нет', async () => {
    const response = await request(app).get('/tickets?date=2025-01-01')
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(0)
  })
})
describe('DELETE /cancel-in-work', async () => {
  let tickets

  beforeAll(async () => {
    await sequelize.sync({ force: true })

    tickets = await Ticket.bulkCreate([
      { topic: 'Ticket 1', description: 'Desc 1', status: 'В работе', createdAt: new Date('2024-02-20') },
      { topic: 'Ticket 2', description: 'Desc 2', status: 'В работе', createdAt: new Date('2024-02-21') },
      { topic: 'Ticket 3', description: 'Desc 3', status: 'В работе', createdAt: new Date('2024-02-22') }
    ])
  })

  it('Отменить все тикеты', async () => {
    const response = await request(app).delete('/tickets/cancel-in-work');
    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Отменено 3 обращений')
  });
})