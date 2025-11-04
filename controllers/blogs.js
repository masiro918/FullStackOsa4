const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

const addBlog = (blog) => {
  const newBlog = new Blog(blog)
  return newBlog.save()
}

const getAllBlogs = () => {
  return Blog.find({})
}

blogsRouter.get('/', (request, response) => {
  getAllBlogs().then((blogs) => {
    response.json(blogs)
  })
})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  addBlog(blog).then((result) => {
    response.status(201).json(result)
  })
})

module.exports = blogsRouter
