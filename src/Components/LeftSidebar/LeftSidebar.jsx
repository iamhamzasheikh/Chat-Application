import './LeftSidebar.css'
import assets from '../../assets/assets/'

const LeftSidebar = () => {
  return (
    <div className='left-side'>
        <div className="left-side-top">
            <div className="left-side-nav">
                <img src={assets.logo} alt="logo" className='logo' />
            </div>

        </div>
      
    </div>
  )
}

export default LeftSidebar
