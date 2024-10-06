import './RightSidebar.css'
import assets from '../../assets/assets/'
import { logout } from '../../Config/Firebase'
const RightSidebar = () => {
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
      <button onClick={()=>logout}>Logout</button>
    </div>
  )
}

export default RightSidebar
