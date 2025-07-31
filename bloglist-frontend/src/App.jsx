import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import LoginForm  from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notification from './components/Notification'
import Togglable from './components/Togglable'
import '../index.css'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState(null)
  const [notificationType, setNotificationType] = useState(null)

  const blogFormRef = useRef()

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs )
    )
  }, [])

  // Loading user from localstorage
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogAppUser')
    if (loggedUserJSON) {
      const userData = JSON.parse(loggedUserJSON)
      setUser(userData)
      blogService.setToken(userData.token)
    }
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification(message)
    setNotificationType(type)
    setTimeout(() => {
      setNotification(null)
      setNotificationType(null)
    }, 3000)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const userData = await loginService.login({ username, password })
      window.localStorage.setItem(
        'loggedBlogAppUser', JSON.stringify(userData)
      )
      blogService.setToken(userData.token)
      setUser(userData) //store logged-in user in state
      setUsername('')
      setPassword('')
      showNotification(`Welcome ${userData.name}`)
    } catch (error) {
      console.error('Login Failed', error)
      showNotification('Wrong username or password', 'error')
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogAppUser')
    setUser(null)
    showNotification('Logged out')
  }

  const addBlog = async (blogObject) => {
    try {
      const newBlog = await blogService.create(blogObject)
      setBlogs(blogs.concat(newBlog))
      showNotification(`A new blog "${newBlog.title}" by ${newBlog.author} added`)
      blogFormRef.current.toggleVisibility() // hide form after creation
    } catch (error) {
      console.error('Creating blog failed', error)
      showNotification('Failed to create blog', 'error')
    }
  }

  const updateBlog = async (id, updatedBlog) => {
    try {
      const returnedBlog = await blogService.update(id, updatedBlog)
      setBlogs(blogs.map(blog => blog.id !== id ? blog : returnedBlog))
    } catch (error) {
      console.error(error)
    }
  }

  // Sort blogs by likes descending
  const blogsSortedByLikes = [...blogs].sort((a, b) => b.likes - a.likes)


  const handleDelete = async (id) => {
    const blogToDelete = blogs.find(b => b.id === id)
    const ok = window.confirm(`Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`)
    if (!ok) return

    try {
      await blogService.remove(id)
      setBlogs(blogs.filter(b => b.id !== id))
    } catch (error) {
      console.error('Failed to delete blog:', error)
      // Optionally show notification of failure
    }
  }

  return (
    <div>
      <Notification message={notification} type={notificationType}/>
      {user === null
        ? <LoginForm
          username={username}
          password={password}
          handleLogin={handleLogin}
          setUsername={setUsername}
          setPassword={setPassword}
        />
        : <div>
          <h2>blogs</h2>
          <p data-testid="logged-in-user">{user.name} logged in <button data-testid="logout-button" onClick={handleLogout}>logout</button></p>
          <Togglable buttonLabel="create new blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
          </Togglable>
          {blogsSortedByLikes.map(blog =>
            <Blog
              key={blog.id}
              blog={blog}
              user={user}
              updateBlog={updateBlog}
              handleDelete={handleDelete}
            />
          )}
        </div>
      }
    </div>
  )
}

export default App