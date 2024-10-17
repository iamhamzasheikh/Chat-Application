import './Login.css'
import assets from '../../assets/assets'
import { useState } from 'react'
import { signup, auth, resetPassword } from '../../Config/Firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'react-toastify'
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";


const Login = () => {
  const [currentState, setCurrentState] = useState('Sign up');
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const onSubmitHandler = async (event) => {
    event.preventDefault(email, username, password);
    try {
      if (currentState === 'Sign up') {
        await signup(username, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Logged in successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    }
  }

  return (
    <div className='login-container'>
      <img className='logo' src={assets.logo_big} alt="logo" />

      <form onSubmit={onSubmitHandler} className='login-form'>
        <h2>{currentState}</h2>

        {currentState === 'Sign up' ? <input onChange={(e) => setUserName(e.target.value)} value={username} type="text" className="form-input" placeholder='username' required /> : null}
        <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" className="form-input" placeholder='Email Address' />

        <div className="password-container">

          <input onChange={(e) => setPassword(e.target.value)}
            value={password}
            type={showPassword ? "text" : "password"}
            className="form-input"
            placeholder='Enter Password' />

          {/* Eye icon to toggle password visibility */}
          <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}  {/* Toggle between show/hide icons */}
          </span>

        </div>

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

          {currentState === 'Login' ? <p className='login-toggle'>Forget Password <span onClick={() => resetPassword(email)}>Reset Here</span></p> : null }
        </div>

      </form>

    </div>
  )
}

export default Login
