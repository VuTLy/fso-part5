const { before, test, beforeEach, after, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const User = require('../models/user')
const bcrypt = require('bcrypt')
const helper = require('../utils/test_helper')

const api = supertest(app)

before(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI)
})

describe('when there is initially one user in db', () => {
  let token
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()

    const loginReponse = await api
        .post('/api/login')
        .send({ username: 'root', password: 'sekret' })

    token = loginReponse.body.token
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

describe('user creation validation', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  test('fails with 400 if username is missing', async () => {
    const result = await api.post('/api/users').send({
      name: 'No Username',
      password: 'validpass',
    })

    assert.strictEqual(result.status, 400)
    assert.match(result.body.error, /username/i)
  })

  test('fails with 400 if password is missing', async () => {
    const result = await api.post('/api/users').send({
      username: 'nouserpass',
      name: 'No Password',
    })

    assert.strictEqual(result.status, 400)
    assert.match(result.body.error, /password/i)
  })

  test('fails with 400 if username is shorter than 3 chars', async () => {
    const result = await api.post('/api/users').send({
      username: 'ab',
      name: 'Short Username',
      password: 'validpass',
    })

    assert.strictEqual(result.status, 400)
    assert.match(result.body.error, /username/i)
  })

  test('fails with 400 if password is shorter than 3 chars', async () => {
    const result = await api.post('/api/users').send({
      username: 'validuser',
      name: 'Short Password',
      password: '12',
    })

    assert.strictEqual(result.status, 400)
    assert.match(result.body.error, /password/i)
  })
})

after(async () => {
  await mongoose.connection.close()
})
