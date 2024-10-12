import './ChatBox.css'
import assets from '../../assets/assets/'
import { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../Context/AppContext'
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../Config/Firebase'
import { toast } from 'react-toastify'

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext); // Updated messageId here

  const [input, setInput] = useState('');

  const sendMessage = async () => {
     try {
      if (input && messagesId) {

        await updateDoc(doc(db, 'messages', messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date()
          })
        })
      }
      const userIds = [chatUser.rId, userData.userData.id];
      userIds.forEach(async(id)=> {
        const userChatsRef = doc(db, 'chats', id)
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = await userChatsSnapshot.data();

          const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId===messagesId);
          userChatsData.chatsData[chatIndex].lastMessage=input.slice(0, 30) ;
          userChatsData.chatsData[chatIndex].updatedAt = Date.now();

          if (userChatsData.chatsData[chatIndex].rId === userData.id) {
            userChatsData.chatsData[chatIndex].messageSeen = false;
          }

          await updateDoc(userChatsRef, {
            chatsData: userChatsData.chatsData
          });
        }


      })

     } catch (error) {
      toast.error(error.message);
      
     }
  }

  // Listen for new messages when messageId is set
  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
        if (res.exists()) {  // Check if document exists
          const data = res.data();
          if (data && data.messages) {
            setMessages(data.messages.reverse()); // Update the state
            console.log(data.messages.reverse());
          }
        }
      });

      return () => unSub(); // Unsubscribe on cleanup
    }
  }, [messagesId, setMessages]); // Added setMessages as a dependency for safety

  return chatUser ? 
    <div className='chat-box-container'>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>{chatUser.userData.name} <img className='dot' src={assets.green_dot} alt="" /></p>
        <img src={assets.help_icon} className='help' alt="" />
      </div>

      {/* Chat messages */}
      <div className="chat-message">
        {messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={message.senderId === userData.id ? 'sender-message' : 'receiver-message'}>
              <p className='message'>{message.text}</p>
              <div>
                <img src={assets.profile_img} alt="" />
                <p>{new Date(message.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>
          ))
        ) : (
          <div style={{display:'flex', alignItems:'center', flexDirection:'column', justifyContent:'center'}}>
            <img style={{width:'80px'}} src={assets.logo_icon} alt="" />
            <p>No messages yet.</p>
          </div>
          
        )}
      </div>

      {/* Input area */}
      <div className="chat-input">
        <input type="text" placeholder='Send a message' value={input} onChange={(e) => setInput(e.target.value)} />
        <input type="file" id='image' accept='image/png , image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img src={assets.send_button} alt="" onClick={sendMessage} />
      </div>
    </div>
   : 
    <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  ;
}

export default ChatBox;
