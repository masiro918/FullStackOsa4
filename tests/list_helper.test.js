const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const listHelper = require('../utils/list_helper')
const Blog = require('../models/blog')
const blogsController = require('../controllers/blogs')
const app = require('../app')

const blogs = [
  {
      _id: "5a422a851b54a676234d17f7",
      title: "React patterns",
      author: "Michael Chan",
      url: "https://reactpatterns.com/",
      likes: 7,
      __v: 0
  },
  {
      _id: "5a422aa71b54a676234d17f8",
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
      likes: 5,
      __v: 0
  },
  {
      _id: "5a422b3a1b54a676234d17f9",
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
      __v: 0
  },
  {
      _id: "5a422b891b54a676234d17fa",
      title: "First class tests",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 10,
      __v: 0
  },
  {
      _id: "5a422ba71b54a676234d17fb",
      title: "TDD harms architecture",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
      likes: 0,
      __v: 0
  },
  {
      _id: "5a422bc61b54a676234d17fc",
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
      __v: 0
  }  
]

beforeEach(async () => {
  let i = 0
  await Blog.deleteMany({})
  console.log('DB reseted!')

  await Blog.insertMany(blogs)
  console.log('Models insterted into db')
})

test('dummy returns one', () => {
  const result = listHelper.dummy([])
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 36)
  })
})

const api = supertest(app)

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all added blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, blogs.length)
})

test('identifier property is named as "id"', async () => {
  const response = await api.get('/api/blogs')

  response.body.forEach(blog => { assert.ok(blog.id)})
})

test('user can add a new blog', async () => {
  const newBlog = {
    title: "Secret blog",
    author: "user123",
    url: "no url",
  }
  
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const currentBlogs = response.body

  assert.strictEqual(currentBlogs.length, blogs.length + 1)
})

test('user can delete blog', async() => {
  let response = await api.get('/api/blogs')
  const currentBlogs = response.body
  const blogToDelete = currentBlogs[0]

  await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204)


  response = await api.get('/api/blogs')
  const blogsAtEnd = response.body

  assert(!blogsAtEnd.includes(blogToDelete))

  assert.strictEqual(blogsAtEnd.length, blogs.length - 1)
})

after(async () => {
  await mongoose.connection.close()
})


