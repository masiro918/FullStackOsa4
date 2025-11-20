const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

const getAllusers = () => {
  return User.find({}).populate('blogs', { title: 1, author: 1, url: 1, likes: 1})
}

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
    blogs: []
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.get('/', (request, response) => {
  getAllusers().then((users) => {
    response.json(users)
  })
})

module.exports = usersRouter