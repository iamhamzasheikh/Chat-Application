import './RightSidebar.css'
import assets from '../../assets/assets/'
import { db, logout } from '../../Config/Firebase'
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import { doc, getDoc } from 'firebase/firestore';

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

  const { chatUser, messages } = useContext(AppContext)
  const [msgImages, setMsgImages] = useState([])
  const [userData, setUserData] = useState({
    name: '',
    avatar: '',
    bio: '',
  });


  useEffect(() => {
    const fetchUserData = async () => {
      if (chatUser && chatUser.userData && chatUser.userData.id) {
        const userDocRef = doc(db, 'users', chatUser.userData.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserData({
            name: userData.name || "Anonymous",
            avatar: userData.avatar || assets.defaultAvatar,  // Default avatar fallback
            bio: userData.bio || "No bio available",
          });
        }
      }
    };

    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
      setMsgImages(tempVar);
    })



    fetchUserData();
  }, [chatUser, messages]);


  return chatUser ? (
    <div className='right-side-bar-container'>
      <div className="right-side-profile">
        <img src={userData.avatar} alt={`${userData.name}'s avatar`} />
        <h3> {userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className='dot' alt="" /> : null}</h3>
        <p>{userData.bio}</p>
      </div>
      <hr />
      <div className="right-side-media">
        <p>Media</p>
        <div>
          {msgImages.map((url, index) => (<img onClick={()=>window.open(url)} key={index} src={url} alt="" />))}
        </div>

        {/* <div>
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
        </div> */}

      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  ) :

    (
      <div className="right-side-bar-container">
        <button onClick={() => logout()}>Logout</button>
      </div>
    )
}
export default RightSidebar
