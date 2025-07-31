import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import Blog from './Blog';
import BlogForm from './BlogForm'

test('renders title and author, but not url or likes by default', () => {
  const blog = {
    title: 'Test Blog',
    author: 'John Doe',
    url: 'http://example.com',
    likes: 5,
    user: { name: 'User' }
  };

  const { container } = render(<Blog blog={blog} updateBlog={() => {}} />);

  const div = container.querySelector('.blog');
  expect(div).toHaveTextContent('Test Blog John Doe');

  const details = container.querySelector('.blog-details');
  expect(details).toBeNull();
});

test('URL and likes are shown after clicking the view button', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'John Doe',
    url: 'http://example.com',
    likes: 5,
    user: { name: 'Tester' }
  }

  const user = userEvent.setup()
  const { container } = render(<Blog blog={blog} updateBlog={() => {}} />)

  // Initially hidden
  expect(container.querySelector('.blog-details')).toBeNull()

  // Click the view button
  const viewButton = container.querySelector('button')
  await user.click(viewButton)

  // Now visible
  const details = container.querySelector('.blog-details')
  expect(details).toHaveTextContent('http://example.com')
  expect(details).toHaveTextContent('5 likes')
})

test('clicking like button twice calls event handler twice', async () => {
  const blog = {
    title: 'Test Blog',
    author: 'John Doe',
    url: 'http://example.com',
    likes: 5,
    user: { name: 'Tester' }
  }

  const mockUpdate = vi.fn() // or jest.fn()
  const user = userEvent.setup()

  const { container } = render(<Blog blog={blog} updateBlog={mockUpdate} />)

  // Show details
  const viewButton = container.querySelector('button')
  await user.click(viewButton)

  // Find like button
  const likeButton = container.querySelector('.like-button')
  await user.click(likeButton)
  await user.click(likeButton)

  expect(mockUpdate).toHaveBeenCalledTimes(2)
})

test('calls event handler with right details when a new blog is created', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  const { container } = render(<BlogForm createBlog={createBlog} />)

  // Find inputs
  const titleInput = container.querySelector('input[name="title"]')
  const authorInput = container.querySelector('input[name="author"]')
  const urlInput = container.querySelector('input[name="url"]')
  const submitButton = container.querySelector('button[type="submit"]')

  // Fill form
  await user.type(titleInput, 'Testing React Components')
  await user.type(authorInput, 'John Doe')
  await user.type(urlInput, 'https://example.com')

  // Submit form
  await user.click(submitButton)

  // Assertions
  expect(createBlog).toHaveBeenCalledTimes(1)
  expect(createBlog).toHaveBeenCalledWith({
    title: 'Testing React Components',
    author: 'John Doe',
    url: 'https://example.com'
  })
})