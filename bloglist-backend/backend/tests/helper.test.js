const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
    test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const listWithOneBlog = [
        {
          _id: '5a422aa71b54a676234d17f8',
          title: 'Go To Statement Considered Harmful',
          author: 'Edsger W. Dijkstra',
          url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
          likes: 5,
          __v: 0
        }
      ]
      
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of a bigger list is calculated right', () => {
    const blogs = [
      {
        title: 'Blog 1',
        author: 'Author A',
        url: 'http://example.com/1',
        likes: 2
      },
      {
        title: 'Blog 2',
        author: 'Author B',
        url: 'http://example.com/2',
        likes: 3
      },
      {
        title: 'Blog 3',
        author: 'Author C',
        url: 'http://example.com/3',
        likes: 10
      }
    ]
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 15)
  })
})

describe('favorite blog', () => {
  test('of empty list is null', () => {
    const result = listHelper.favoriteBlog([])
    assert.strictEqual(result, null)
  })

  test('when list has only one blog, it is the favorite', () => {
    const blogs = [
      {
        _id: '1',
        title: 'Single Blog',
        author: 'Author One',
        url: 'http://example.com',
        likes: 10,
        __v: 0
      }
    ]
    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[0])
  })

  test('of a bigger list is returned correctly', () => {
    const blogs = [
      {
        _id: '1',
        title: 'First Blog',
        author: 'Author One',
        url: 'http://one.com',
        likes: 7,
        __v: 0
      },
      {
        _id: '2',
        title: 'Second Blog',
        author: 'Author Two',
        url: 'http://two.com',
        likes: 5,
        __v: 0
      },
      {
        _id: '3',
        title: 'Third Blog',
        author: 'Author Three',
        url: 'http://three.com',
        likes: 12,
        __v: 0
      }
    ]

    const result = listHelper.favoriteBlog(blogs)
    assert.deepStrictEqual(result, blogs[2])
  })
})

describe('most blogs', () => {
  const blogs = [
    {
      title: "Blog A",
      author: "Robert C. Martin",
      likes: 5,
    },
    {
      title: "Blog B",
      author: "Edsger W. Dijkstra",
      likes: 12,
    },
    {
      title: "Blog C",
      author: "Robert C. Martin",
      likes: 8,
    },
    {
      title: "Blog D",
      author: "Robert C. Martin",
      likes: 2,
    },
    {
      title: "Blog E",
      author: "Edsger W. Dijkstra",
      likes: 1,
    },
  ]

  test('author with most blogs is returned', () => {
    const result = listHelper.mostBlogs(blogs)
    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      blogs: 3,
    })
  })

  test('empty list returns null', () => {
    const result = listHelper.mostBlogs([])
    assert.strictEqual(result, null)
  })
})

describe('most likes', () => {
  const blogs = [
    {
      title: "Blog A",
      author: "Robert C. Martin",
      likes: 5,
    },
    {
      title: "Blog B",
      author: "Edsger W. Dijkstra",
      likes: 12,
    },
    {
      title: "Blog C",
      author: "Robert C. Martin",
      likes: 8,
    },
    {
      title: "Blog D",
      author: "Robert C. Martin",
      likes: 2,
    },
    {
      title: "Blog E",
      author: "Edsger W. Dijkstra",
      likes: 1,
    },
  ]

  test('author with most likes is returned', () => {
    const result = listHelper.mostLikes(blogs)
    assert.deepStrictEqual(result, {
      author: 'Robert C. Martin',
      likes: 15,
    })
  })

  test('empty list returns null', () => {
    const result = listHelper.mostLikes([])
    assert.strictEqual(result, null)
  })
})
