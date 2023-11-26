import { useState } from 'react'

const Users = () => {
  const [user, setUser] = useState({
    username: '',
    password: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setUser({
      username: '',
      password: '',
    })
  }

  return (
    <div>
      <form onSubmit={handleSubmit}></form>
      <div onClick={(e) => e.stopPropagation()}>
        <div>
          <h4>Login</h4>
        </div>
        <div>
          <label htmlFor=''>
            Username:
            <input
              name='userName'
              type='text'
              value={user.username}
              onChange={handleInputChange}
            />
          </label>
          <br />
          <label htmlFor=''>
            Password:
            <input
              name='password'
              type='password'
              value={user.password}
              onChange={handleInputChange}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default Users
