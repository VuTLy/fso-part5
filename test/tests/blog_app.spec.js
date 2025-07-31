const { test, expect, beforeEach, describe } = require('@playwright/test')

// Helper function for logging in
async function login(page, username, password) {
    await page.getByTestId('username').fill(username)
    await page.getByTestId('password').fill(password)
    await page.getByTestId('login-button').click()
}

async function createBlog(page, title, author, url) {
    await page.getByRole('button', { name: 'create new blog' }).click()
    await page.getByTestId('title-input').fill(title)
    await page.getByTestId('author-input').fill(author)
    await page.getByTestId('url-input').fill(url)
    await page.getByTestId('create-button').click()
}

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        // Reset backend DB
        await request.post('http://localhost:3001/api/testing/reset')

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen'
        }
        await request.post('http://localhost:3001/api/users', { data: newUser })

        await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Log in to application' })).toBeVisible()
        await expect(page.getByTestId('username')).toBeVisible()
        await expect(page.getByTestId('password')).toBeVisible()
        await expect(page.getByTestId('login-button')).toBeVisible()
    })

    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            await login(page, 'mluukkai', 'salainen')
            await expect(page.getByTestId('logged-in-user')).toBeVisible()
            await expect(page.getByTestId('logged-in-user')).toContainText('Matti Luukkainen')
        })

        test('login fails with wrong password', async ({ page }) => {
            await login(page, 'mluukkai', 'wrongpassword')
            await expect(page.getByText(/wrong username or password/i)).toBeVisible()
            await expect(page.getByTestId('login-button')).toBeVisible()
        })
    })

    describe.only('When logged in', () => {
        test.beforeEach(async ({ page }) => {
            await login(page, 'mluukkai', 'salainen')
            await createBlog(page, 'Blog to be liked', 'Author Test', 'http://like.test')
        })
    
        test('a new blog can be created', async ({ page }) => {
            await expect(page.getByText('Blog to be liked Author Test')).toBeVisible()
        })

        test('a blog can be liked', async ({ page }) => {
            // Show details
            await page.getByRole('button', { name: 'view' }).click()
    
            // Capture likes before clicking
            const likesBefore = await page.locator('.likes').innerText()
    
            // Click like
            await page.locator('.like-button').click()
    
            // Expect likes count to change
            await expect(page.locator('.likes')).not.toHaveText(likesBefore)
        })

        test('the user who created a blog can delete it', async ({ page }) => {
            await createBlog(page, 'Blog to delete', 'Author Test', 'http://delete.test/blog')

            // Wait for new blog to be visible before reload
            await expect(page.getByText('Blog to delete Author Test')).toBeVisible()

            await page.reload()

            // Wait for the blog container with correct text to be visible
            const targetBlog = page.locator('.blog', { hasText: 'Blog to delete Author Test' })
            await expect(targetBlog).toBeVisible()

            // Wait for the view button in that specific blog to be ready
            await expect(targetBlog.getByTestId('view-button')).toBeVisible()
            await targetBlog.getByTestId('view-button').click()

            // Handle confirm dialog
            page.once('dialog', dialog => dialog.accept())

            // Wait for remove button to be ready and click it
            await expect(targetBlog.getByTestId('remove-button')).toBeVisible()
            await targetBlog.getByTestId('remove-button').click()

            // Verify the blog is removed
            await expect(page.getByText('Blog to delete Author Test')).not.toBeVisible()
        })

        test.only('blogs are ordered by likes descending', async ({ page }) => {
          
            // Create multiple blogs
            await createBlog(page, 'First blog', 'Author A', 'http://first.blog')
            await createBlog(page, 'Second blog', 'Author B', 'http://second.blog')
            await createBlog(page, 'Third blog', 'Author C', 'http://third.blog')
          
            // Reload page to ensure fresh state
            await page.reload()
          
            // Like blogs different amounts:
            // Like Second blog 2 times
            let secondBlog = page.locator('.blog', { hasText: 'Second blog Author B' })
            await secondBlog.getByTestId('view-button').click()
            const likeButtonSecond = secondBlog.getByTestId('like-button')
            await likeButtonSecond.click()
            await likeButtonSecond.click()
          
            // Like Third blog 3 times
            let thirdBlog = page.locator('.blog', { hasText: 'Third blog Author C' })
            await thirdBlog.getByTestId('view-button').click()
            const likeButtonThird = thirdBlog.getByTestId('like-button')
            await likeButtonThird.click()
            await likeButtonThird.click()
            await likeButtonThird.click()
          
            // Like First blog 1 time
            let firstBlog = page.locator('.blog', { hasText: 'First blog Author A' })
            await firstBlog.getByTestId('view-button').click()
            const likeButtonFirst = firstBlog.getByTestId('like-button')
            await likeButtonFirst.click()
          
            // Now get all blog elements in order they appear
            const blogs = page.locator('.blog')
            const count = await blogs.count()
          
            // Extract likes count from each blog displayed
            let likesArray = []
            for (let i = 0; i < count; i++) {
              const blog = blogs.nth(i)
              const toggleButton = blog.getByTestId('view-button')
              const buttonText = await toggleButton.innerText()

              if (buttonText === 'view') {
                await toggleButton.click()
              }
              const likesText = await blog.locator('.likes').innerText()
              const likes = parseInt(likesText.split(' ')[0]) // "X likes"
              likesArray.push(likes)
            }
          
            // Assert likesArray is sorted descending
            for (let i = 0; i < likesArray.length - 1; i++) {
              expect(likesArray[i]).toBeGreaterThanOrEqual(likesArray[i + 1])
            }
          })
    })
})