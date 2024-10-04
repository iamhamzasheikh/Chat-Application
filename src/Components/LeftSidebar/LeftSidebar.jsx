import './LeftSidebar.css'
import assets from '../../assets/assets/'

const LeftSidebar = () => {
  return (
    <div className='left-side'>
      <div className="left-side-top">
        <div className="left-side-nav">
          <img src={assets.logo} alt="logo" className='logo' />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />

            <div className='sub-menu'>
              <p>Edit profile</p>
              <hr />
              <p>Logout</p>
            </div>
            
          </div>
        </div>
        <div className="left-side-search">
          <img src={assets.search_icon} alt="" />
          <input type="text" placeholder='Search here' />
        </div>
      </div>

      <div className="left-side-list">
        {Array(10).fill('').map((item, index) => (
          <div key={index} className="friends">
            <img src={assets.profile_img} alt="" />
            <div>
              <p>Hamza Sheikh</p>
              <span>Hello, How are you?</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeftSidebar
