function LoginForm({ username, password, handleLogin, setUsername, setPassword }) {
  return (
    <div>
      <h2>Log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            data-testid="username"  
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            data-testid="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button data-testid="login-button" type="submit">login</button>
      </form>
    </div>
  )
}

export default LoginForm
