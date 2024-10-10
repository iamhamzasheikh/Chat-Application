import './LeftSidebar.css'
import assets from '../../assets/assets/'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../Config/Firebase'
import { useContext } from 'react'
import { AppContext } from '../../Context/AppContext'

const LeftSidebar = () => {
  const navigate = useNavigate()

  const {userData} = useContext(AppContext);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      console.log('input value', input)
      const userRef = collection(db, 'users')

      const q = query(userRef, where('username', '==', input.toLowerCase()));
      const querySnap = await getDocs(q);

      if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
        console.log(querySnap.docs[0].data());
      }



    }
     catch (error) {
      console.log(error);
     }
  }

  return (
    <div className='left-side'>
      <div className="left-side-top">
        <div className="left-side-nav">
          <img src={assets.logo} alt="logo" className='logo' />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />

            <div className='sub-menu'>
              <p onClick={() => navigate('/profileUpdate')}>Edit profile</p>
              <hr />
              <p>Logout</p>
            </div>

          </div>
        </div>
        <div className="left-side-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search here' />
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
