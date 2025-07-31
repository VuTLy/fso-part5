const _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
  if (!Array.isArray(blogs) || blogs.length === 0) {
    return 0  // No blogs, no likes
  }

  return blogs.reduce((sum, blog) => sum + (blog.likes || 0), 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  return blogs.reduce((max, blog) => {
    return blog.likes > (max.likes || 0) ? blog : max
  })
}

// 4.6: Author with the most blog posts
const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const grouped = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(Object.keys(grouped), author => grouped[author])

  return {
    author: topAuthor,
    blogs: grouped[topAuthor]
  }
}

// 4.7: Author with the most total likes
const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const grouped = _.groupBy(blogs, 'author')
  const likesByAuthor = _.map(grouped, (blogs, author) => ({
    author,
    likes: _.sumBy(blogs, 'likes')
  }))

  return _.maxBy(likesByAuthor, 'likes')
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}