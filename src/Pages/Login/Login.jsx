import './Login.css'
import assets from '../../assets/assets'

const Login = () => {
  return (
    <div className='login-container'>
      <img className='logo' src={assets.logo_big} alt="logo" />

      <form className='login-form'>
        <h2>Sign up</h2>

        <input type="text" className="form-input" placeholder='username' required />
        <input type="email" className="form-input" placeholder='Email Address' />
        <input type="password" className="form-input" placeholder='create password' />

        <button type="submit">Sign Up</button>

        <div className="login-term">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className="login-forgot">
          <p className='login-toggle'>Already have an account <span>Click Here</span></p>
        </div>

      </form>
     
    </div>
  )
}

export default Login
