const { before, beforeEach, after, describe, test } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let token
let userId

before(async () => {
  await mongoose.connect(process.env.TEST_MONGODB_URI)
  // Reset users and create a new one for token
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ 
    username: 'blogger', 
    name: 'Blog Tester',
    passwordHash 
  })
  const savedUser = await user.save()

  userId = savedUser._id.toString() 

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'blogger', password: 'sekret' })

  token = loginResponse.body.token

})

beforeEach(async () => {
  await Blog.deleteMany({})

  const blog = new Blog({
    title: 'Initial Blog',
    author: 'Author',
    url: 'http://example.com',
    likes: 1,
    user: userId,
  })

  await blog.save()
})
  

describe('GET /api/blogs', () => {
  test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
  })

  test('unique identifier property of blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const blogs = response.body

    assert.ok(blogs.length > 0, 'Expected at least one blog')

    const blog = blogs[0]
    assert.ok(blog.id, 'Blog should have an id field')
    assert.strictEqual(typeof blog.id, 'string', 'id should be a string')
    assert.strictEqual(blog._id, undefined, 'Blog should not have _id field')
  })
})

describe('POST /api/blogs', () => {
  test('successfully creates a new blog', async () => {
    const blogsAtStart = await Blog.find({})

    const newBlog = {
      title: 'New Blog Title',
      author: 'New Author',
      url: 'http://newblog.com',
      likes: 5,
    }

    const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)

    console.log('Create Blog Response Status:', response.status)
    console.log('Create Blog Response Body:', response.body)

    // Continue with assertions
    assert.strictEqual(response.status, 201)
    assert.match(response.headers['content-type'], /application\/json/)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length + 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert.ok(titles.includes(newBlog.title))

    const createdBlog = blogsAtEnd.find(b => b.title === newBlog.title)
    assert.strictEqual(createdBlog.author, newBlog.author)
    assert.strictEqual(createdBlog.url, newBlog.url)
    assert.strictEqual(createdBlog.likes, newBlog.likes)
  })

  test('if likes property is missing, it defaults to 0', async () => {
    const newBlog = {
      title: 'Blog without likes',
      author: 'Author',
      url: 'http://nolikes.com',
    }

    const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)

    console.log('No Likes Blog Response Status:', response.status)
    console.log('No Likes Blog Response Body:', response.body)

    assert.strictEqual(response.status, 201)
    assert.match(response.headers['content-type'], /application\/json/)
    assert.strictEqual(response.body.likes, 0)
  })

  test('blog without title is not added and returns 400', async () => {
    const newBlog = {
      author: 'Author',
      url: 'http://validurl.com',
      likes: 5,
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
  })

  test('blog without url is not added and returns 400', async () => {
    const newBlog = {
      title: 'Valid Title',
      author: 'Author',
      likes: 5,
    }

    await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(newBlog)
        .expect(400)
  })
})

describe('DELETE /api/blogs/:id', () => {
  test('succeeds with status 204 and blog is removed', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToDelete = blogsAtStart[0]

    await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

    const blogsAtEnd = await Blog.find({})
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

    const ids = blogsAtEnd.map(b => b._id.toString())
    assert.ok(!ids.includes(blogToDelete._id.toString()))
  })
})

describe('PUT /api/blogs/:id', () => {
  test('updating likes of a blog works and returns updated blog', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      likes: blogToUpdate.likes + 1,
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
  })

  test('updating a non-existent blog returns 404', async () => {
    const validNonExistingId = new mongoose.Types.ObjectId()

    const updatedData = {
      likes: 10,
    }

    await api
        .put(`/api/blogs/${validNonExistingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData)
        .expect(404)
  })

  test('updating blog with invalid data returns 400', async () => {
    const blogsAtStart = await Blog.find({})
    const blogToUpdate = blogsAtStart[0]

    const invalidData = {
      likes: 'invalid-likes',
    }

    await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400)
  })
})

after(async () => {
  await mongoose.connection.close()
})
