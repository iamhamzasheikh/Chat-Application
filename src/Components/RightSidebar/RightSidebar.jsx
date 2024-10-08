import './RightSidebar.css'
import assets from '../../assets/assets/'
import { logout } from '../../Config/Firebase'
import { useNavigate } from 'react-router-dom';

const RightSidebar = () => {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');  // Navigate back to login page after successful logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
  return (
    <div className='right-side-bar-container'>
      <div className="right-side-profile">
        <img src={assets.profile_img} alt="" />

        <h3>Hamza Sheikh <img src={assets.dot} className='dot' alt="" /></h3>

        <p>Hey, there i am hamza Sheikh</p>
      </div>
      <hr />
      <div className="right-side-media">
        <p>Media</p>
        <div>
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
        </div>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
export default RightSidebar
