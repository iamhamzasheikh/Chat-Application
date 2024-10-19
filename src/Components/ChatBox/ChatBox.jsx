import './ChatBox.css';
import assets from '../../assets/assets/';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Config/Firebase';
import { toast } from 'react-toastify';

const ChatBox = () => {
  const { userData, messageId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext);
  const [isOnline, setIsOnline] = useState(false);
  const [input, setInput] = useState('');
  const [chatUserData, setChatUserData] = useState({
    name: '',
    avatar: '',
    bio: '',
  });

  const handleBackClick = () => {
    setChatVisible(false);
  };

  useEffect(() => {
    // Fetch messages and chat user data if `messageId` exists
    if (messageId) {
      // Messages listener
      const messageDocRef = doc(db, 'messages', messageId);
      const unSubMessages = onSnapshot(messageDocRef, (res) => {
        if (res.exists()) {
          const data = res.data();
          if (data && data.messages) {
            setMessages(data.messages.reverse());
          }
        }
      });

      // Chat user status listener
      let unSubUserStatus;
      if (chatUser && chatUser.userData && chatUser.userData.id) {
        const userDocRef = doc(db, 'users', chatUser.userData.id);

        // Real-time listener for user status and data
        unSubUserStatus = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setChatUserData({
              name: data.name || 'Anonymous',
              avatar: data.avatar || assets.defaultAvatar,
              bio: data.bio || 'No bio available',
              lastSeen: data.lastSeen
            });

            // Check if user is online (last seen within last 2 minutes)
            if (data.lastSeen) {
              const lastSeenDate = data.lastSeen.toDate ?
                data.lastSeen.toDate() :
                new Date(data.lastSeen);
              const timeDiff = Date.now() - lastSeenDate.getTime();
              setIsOnline(timeDiff <= 120000); // 2 minutes threshold
            } else {
              setIsOnline(false);
            }
          }
        });
      }

      // Cleanup listeners
      return () => {
        unSubMessages();
        if (unSubUserStatus) {
          unSubUserStatus();
        }
      };
    }
  }, [messageId, chatUser, setMessages]);

  const upload = async (file) => {
    if (!file) return null;

    const storageRef = ref(storage, `chat_images/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const sendMessage = async () => {
    if (!input.trim() || !messageId) return;

    try {
      const messageDocRef = doc(db, 'messages', messageId);
      const docSnap = await getDoc(messageDocRef);

      if (!docSnap.exists()) {
        await setDoc(messageDocRef, { messages: [] });
      }

      await updateDoc(messageDocRef, {
        messages: arrayUnion({
          sId: userData.id,
          text: input.trim(),
          createdAt: new Date()
        })
      });

      // Update current user's chat
      const userChatsRef = doc(db, 'chats', userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);

      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === messageId);

        if (chatIndex !== -1) {
          userChatsData.chatsData[chatIndex].lastMessage = input.trim().slice(0, 30);
          userChatsData.chatsData[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chatsData: userChatsData.chatsData
          });
        }
      }

      // Update recipient's chat
      const recipientChatsRef = doc(db, 'chats', chatUser.rId);
      const recipientChatsSnapshot = await getDoc(recipientChatsRef);

      if (recipientChatsSnapshot.exists()) {
        const recipientChatsData = recipientChatsSnapshot.data();
        const chatIndex = recipientChatsData.chatsData.findIndex((c) => c.messageId === messageId);

        if (chatIndex !== -1) {
          recipientChatsData.chatsData[chatIndex].lastMessage = input.trim().slice(0, 30);
          recipientChatsData.chatsData[chatIndex].updatedAt = Date.now();
          recipientChatsData.chatsData[chatIndex].messageSeen = false;

          await updateDoc(recipientChatsRef, {
            chatsData: recipientChatsData.chatsData
          });
        }
      }

      setInput('');
    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);
      if (fileUrl && messageId) {
        await updateDoc(doc(db, 'messages', messageId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          })
        });

        const userIds = [chatUser.rId, userData.id];
        for (const id of userIds) {
          const userChatsRef = doc(db, 'chats', id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatsData = userChatsSnapshot.data();
            const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === messageId);

            if (chatIndex !== -1) {
              userChatsData.chatsData[chatIndex].lastMessage = 'image';
              userChatsData.chatsData[chatIndex].updatedAt = Date.now();

              if (id === chatUser.rId) {
                userChatsData.chatsData[chatIndex].messageSeen = false;
              }

              await updateDoc(userChatsRef, {
                chatsData: userChatsData.chatsData
              });
            }
          }
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Helper function for formatting date
  const formatMessageDate = (timestamp) => {
    if (!timestamp) return '';

    const messageDate = timestamp.toDate();
    const now = new Date();

    // Reset hours to compare just the dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

    // Time format
    const timeString = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // If message is from today
    if (messageDay.getTime() === today.getTime()) {
      return timeString;
    }

    // If message is from yesterday
    if (messageDay.getTime() === yesterday.getTime()) {
      return `Yesterday, ${timeString}`;
    }

    // If message is within last 7 days
    const daysAgo = (today - messageDay) / (1000 * 60 * 60 * 24);
    if (daysAgo < 7) {
      return `${messageDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${timeString}`;
    }

    // For older messages, show full date
    return `${messageDate.getDate().toString().padStart(2, '0')}-${(messageDate.getMonth() + 1).toString().padStart(2, '0')}-${messageDate.getFullYear()}, ${timeString}`;
  };




  return chatUser ? (
    <div className={`chat-box-container ${chatVisible ? 'visible' : ''}`}>

      <div className="chat-user">
        <img src={chatUserData.avatar} alt={`${chatUserData.name}'s avatar`} />
        {/* <p>{chatUserData.name} {Date.now()-chatUser.userData.lastSeen <= 70000 ? <img className='dot' src={assets.green_dot} alt="online status" /> : null} </p> */}
        <p>
          {chatUserData.name}
          {isOnline && <img className='dot' src={assets.green_dot} alt="online status" />}
        </p>
        {chatVisible && (<button className="back-button" onClick={handleBackClick}>← Back</button>)}
      </div>


      <div className="chat-message">
        {messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={message.sId === userData.id ? 'sender-message' : 'receiver-message'}>
              {message.image ? (<img className='message-image' src={message.image} alt="Sent image" />)
                : (<p className='message'>{message.text}</p>)}

              <div>
                <img src={message.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                {/* <p>{new Date(message.createdAt.toDate()).toLocaleTimeString()}</p> */}
                <p>{formatMessageDate(message.createdAt)}</p>
              </div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center' }}>
            <img style={{ width: '80px' }} src={assets.logo_icon} alt="" />
            <p>No messages yet.</p>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder='Send a message'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        />
        <input onChange={sendImage} type="file" id='image' accept='image/png, image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img src={assets.send_button} alt="" onClick={sendMessage} />
      </div>
    </div>
  ) : (
    <div className='chat-welcome'>
      <img src={assets.logo_icon} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;