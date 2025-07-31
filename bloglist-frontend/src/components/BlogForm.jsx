import { useState } from 'react'

function BlogForm({ createBlog }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    createBlog({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>Create new blog</h2>
      <form onSubmit={handleSubmit}>
        <div>
          title:
          <input data-testid="title-input" name='title' value={title} onChange={({ target }) => setTitle(target.value)} />
        </div>
        <div>
          author:
          <input data-testid="author-input" name='author' value={author} onChange={({ target }) => setAuthor(target.value)} />
        </div>
        <div>
          url:
          <input data-testid="url-input" name='url' value={url} onChange={({ target }) => setUrl(target.value)} />
        </div>
        <button data-testid="create-button" type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm