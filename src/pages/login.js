import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './styles/App.css';

function App() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function navRegister() {
    navigate('/register')
  }
  async function loginUser(event) {
    event.preventDefault()
    const response = await fetch('https://transfer-server.vercel.app/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      })
    })

    const data = await response.json()

    if(data.user) {
      localStorage.setItem('token', data.user)
      alert('login succesfull')
      window.location.href = '/dashbord'
    } else {
      alert('please check your username and password')
    }
  }

  return (
    <div className='wrapper'>
    <div className="login-form-container">
      <div className="rectangle"></div>
      <h1>Login</h1>
      <form onSubmit={loginUser}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type='email'
          placeholder='Email'
          className="input-field"
        />
        <br />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type='password'
          placeholder='Password'
          className="input-field"
        />
        <br />
        <input type='submit' value='Login' className="submit-button" />
        <button onClick={navRegister} className="nav-button">Register</button>
      </form>
    </div>
    </div>
  );
}

export default App;
