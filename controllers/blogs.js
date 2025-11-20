const jwt = require('jsonwebtoken')

const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')


const addBlog = (blog) => {
  const newBlog = new Blog(blog)
  return newBlog.save()
}

const getAllBlogs = () => {
  return Blog.find({}).populate('user', { username: 1})
}

const getTokenFrom = request => {  
  const authorization = request.get('authorization')  
  
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')  
  } 
  
  return null
}

blogsRouter.get('/', (request, response) => {
  getAllBlogs().then((blogs) => {
    response.json(blogs)
  })
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)  
  if (!decodedToken.id) {    
    return response.status(401).json({ error: 'token invalid' })  
  }  
  
  const user = await User.findById(decodedToken.id)
  if (!user) {
    return response.status(400).json({ error: 'UserId missing or not valid' })
  }

  blog.user = user._id
  const savedBlog = await addBlog(blog)

  user.blogs = user.blogs.concat(blog._id)
  await user.save()
  
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)  
  if (!decodedToken.id) {    
    return response.status(401).json({ error: 'token invalid' })  
  }  

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter