import './Login.css'
import assets from '../../assets/assets'
import { useState } from 'react'
import { signup, auth } from '../../Config/Firebase'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { toast } from 'react-toastify'
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const Login = () => {
  const [currentState, setCurrentState] = useState('Login');
  const [username, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSending, setIsSending] = useState(false); // For showing "Sending..." on the button
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false); // Track checkbox state


  // Email validation
  const getEmailBorderColor = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return '#c9c9c9';
    return emailRegex.test(email) ? '#4CAF50' : '#f44336';
  };

  // Password strength validation
  const getPasswordBorderColor = (password) => {
    if (!password) return '#c9c9c9';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength < 2) return '#f44336';
    if (strength < 4) return '#FFA726';
    return '#4CAF50';
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === 'Sign up') {
        if (!isCheckboxChecked) {
          toast.error("Please agree to the terms and conditions before creating an account");
          return;
        }
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

  const handlePasswordReset = async () => {
    setIsSending(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent!");
      setIsSending(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
      setIsSending(false);
    }
  };

  return (
    <div className='login-container'>
      <img className='logo' src={assets.logo_big} alt="logo" />

      <form onSubmit={onSubmitHandler} className='login-form'>
        <h2>{currentState}</h2>

        {currentState === 'Sign up' ?
          <input
            onChange={(e) => setUserName(e.target.value)}
            value={username}
            type="text"
            className="form-input"
            placeholder='username'
            required
          /> : null}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          className="form-input"
          placeholder='Email Address'
          style={{ borderColor: getEmailBorderColor(email) }}
        />

        {currentState !== 'Reset' && (
          <div className="password-container">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type={showPassword ? "text" : "password"}
              className="form-input"
              placeholder='Enter Password'
              style={{ borderColor: getPasswordBorderColor(password) }}
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </span>
          </div>
        )}

        <button
          type="submit"
          onClick={currentState === 'Reset' ? handlePasswordReset : onSubmitHandler}
          disabled={isSending}>
          {currentState === 'Reset' ? (isSending ? 'Sending...' : 'Send') : (currentState === 'Sign up' ? 'Create Account' : 'Login Now')}
        </button>


        {currentState === 'Sign up' && (
          <div className="login-term">
            <input type="checkbox" checked={isCheckboxChecked} onChange={(e) => setIsCheckboxChecked(e.target.checked)} />
            <p>Agree to the terms of use & privacy policy.</p>
          </div>
        )}


        <div className="login-forgot">
          {currentState === 'Sign up' ? (
            <>
              <p className='login-toggle'>Already have an account? <span onClick={() => { setCurrentState('Login') }}>Login Here</span></p>
            </>
          ) : currentState === 'Login' ? (
            <p className='login-toggle'>Do not have an account? <span onClick={() => { setCurrentState('Sign up') }}>Create an account</span></p>
          ) : (
            <p className='login-toggle'>Already have an account? <span onClick={() => { setCurrentState('Login') }}>Login Here</span></p>
          )}

          {currentState === 'Login' && (
            <p className='login-toggle'>Forget Password <span onClick={() => setCurrentState('Reset')}>Reset Here</span></p>
          )}

        </div>
      </form>
    </div>
  )
}

export default Login