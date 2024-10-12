import LeftSidebar from '../../Components/LeftSidebar/LeftSidebar'
import RightSidebar from '../../Components/RightSidebar/RightSidebar'
import ChatBox from '../../Components/ChatBox/ChatBox'
import './Chat.css'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext'

const Chat = () => {

  const { chatData, userData } = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    if (chatData && userData) {
      setLoading (false) 
    } 

  },[chatData, userData])
  return (
    <div className='chat-main-container'>
      {
        loading ? <p className='loading'>Loading...</p>
          : <div className="chat-inner-container">
            <LeftSidebar />
            <ChatBox />
            <RightSidebar />
          </div>
      }



    </div>
  )
}

export default Chat
