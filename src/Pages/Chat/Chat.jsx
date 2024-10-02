import LeftSidebar from '../../Components/LeftSidebar/LeftSidebar'
import RightSidebar from '../../Components/RightSidebar/RightSidebar'
import ChatBox from '../../Components/ChatBox/ChatBox'
import './Chat.css'

const Chat = () => {
  return (
    <div className='chat-main-container'>
      <div className="chat-inner-container">
        <LeftSidebar />
        <ChatBox />
        <RightSidebar />

      </div>
    </div>
  )
}

export default Chat
