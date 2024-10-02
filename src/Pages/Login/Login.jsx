import './Login.css'
import assets from '../../assets/assets'
import { useState } from 'react'

const Login = () => {
  const [currentState, setCurrentState] = useState('Sign up');

  return (
    <div className='login-container'>
      <img className='logo' src={assets.logo_big} alt="logo" />

      <form className='login-form'>
        <h2>{currentState}</h2>

        {currentState === 'Sign up' ? <input type="text" className="form-input" placeholder='username' required /> : null}
        <input type="email" className="form-input" placeholder='Email Address' />
        <input type="password" className="form-input" placeholder='Enter Password' />

        <button type="submit">{currentState === 'Sign up' ? "Create Account" : 'Login Now'}</button>

        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className="login-forgot">
          {
            currentState === "Sign up" ? <p className='login-toggle'>Already have an account <span onClick={() => { setCurrentState('Login') }}>Login Here</span></p> :
              <p className='login-toggle'>Create an account <span onClick={() => { setCurrentState('Sign up') }}>Click Here</span></p>
          }
        </div>

      </form>

    </div>
  )
}

export default Login
