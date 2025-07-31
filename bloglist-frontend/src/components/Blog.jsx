import { useState } from 'react'
import PropTypes from 'prop-types'

const Blog = ({ blog, user, updateBlog, handleDelete }) => {
  const [showDetails, setShowDetails] = useState(false)
  console.log('blog.user:', blog.user)
  console.log('user:', user)


  // For debugging
  console.log('blog.user:', blog.user)
  console.log('user:', user)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const handleLike = () => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
      user: blog.user.id || blog.user
    }
    updateBlog(blog.id, updatedBlog)
  }

  // Check if current user is the owner of the blog post
  const showDelete = user && blog.user && (user.username === blog.user.username)

  return (
    <div className='blog' style={blogStyle}>
      <div className='blog-title'>
        {blog.title} {blog.author}
        <button data-testid='view-button'  onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </div>

      {showDetails && (
        <div className='blog-details'>
          <div>{blog.url}</div>
          <div className="likes">{blog.likes} likes <button  data-testid='like-button' className='like-button' onClick={handleLike}>like</button></div>
          <div>{blog.user?.name}</div>
          {showDelete && (
            <button data-testid='remove-button' onClick={() => handleDelete(blog.id)}>remove</button>
          )}
        </div>
      )}
    </div>
  )
}

Blog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    url: PropTypes.string,
    likes: PropTypes.number,
    user: PropTypes.shape({
      username: PropTypes.string,
      name: PropTypes.string
    })
  }).isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired
  }),
  updateBlog: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired
}

export default Blog
