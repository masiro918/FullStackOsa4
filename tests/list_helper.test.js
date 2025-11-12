const { test, describe, beforeEach, after } = require('node:test')
const assert = require('node:assert')
const supertest = require('supertest')
const mongoose = require('mongoose')
const listHelper = require('../utils/list_helper')
const Blog = require('../models/blog')
const blogsController = require('../controllers/blogs')
const app = require('../app')
const blogs = listHelper.blogs

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


