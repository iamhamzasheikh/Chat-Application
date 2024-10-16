import './ChatBox.css';
import assets from '../../assets/assets/';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../Context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Config/Firebase';
import { toast } from 'react-toastify';

const ChatBox = () => {
  const { userData, messageId, chatUser, messages, setMessages } = useContext(AppContext);
  const [input, setInput] = useState('');
  const [chatUserData, setChatUserData] = useState({
    name: '',
    avatar: '',
    bio: '',
  });


  useEffect(() => {
    // Fetch messages and chat user data if `messageId` exists
    if (messageId) {
      const messageDocRef = doc(db, 'messages', messageId);
      const unSubMessages = onSnapshot(messageDocRef, (res) => {
        if (res.exists()) {
          const data = res.data();
          if (data && data.messages) {
            setMessages(data.messages.reverse());
          }
        }
      });

      const fetchChatUserData = async () => {
        if (chatUser && chatUser.userData && chatUser.userData.id) {
          const userDocRef = doc(db, 'users', chatUser.userData.id);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setChatUserData({
              name: data.name || 'Anonymous',
              avatar: data.avatar || assets.defaultAvatar, // Fallback to a default avatar
              bio: data.bio || 'No bio available',
            });
          }
        }
      };

      fetchChatUserData();

      // Cleanup listener for messages
      return () => unSubMessages();
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

  return chatUser ? (
    <div className='chat-box-container'>
      <div className="chat-user">
        <img src={chatUserData.avatar} alt={`${chatUserData.name}'s avatar`} />
        <p>{chatUserData.name} <img className='dot' src={assets.green_dot} alt="online status" /></p>
        <img src={assets.help_icon} className='help' alt="help icon" />
      </div>


      <div className="chat-message">
        {messages && messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={message.sId === userData.id ? 'sender-message' : 'receiver-message'}>
              {message.image ? (<img className='message-image' src={message.image} alt="Sent image" />)
                : (<p className='message'>{message.text}</p>)}

              <div>
                <img src={message.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="" />
                <p>{new Date(message.createdAt.toDate()).toLocaleTimeString()}</p>
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