import { useContext, useState, useEffect } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets/';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../Config/Firebase';
import { AppContext } from '../../Context/AppContext';
import { toast } from 'react-toastify';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, setChatUser, setMessageId, messageId } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [chatsData, setChatsData] = useState([]);
  const [isAddingChat, setIsAddingChat] = useState(false); // New state to prevent multiple clicks

  useEffect(() => {
    if (userData && userData.id) {
      const chatRef = doc(db, "chats", userData.id);
      const unsubscribe = onSnapshot(
        chatRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            // Filter out any chat items with invalid data
            const validChats = (data.chatsData || []).filter(chat => 
              chat && chat.userData && chat.userData.avatar && chat.userData.name
            );
            setChatsData(validChats);
          } else {
            setDoc(chatRef, { chatsData: [] });
            setChatsData([]);
          }
        },
        (error) => {
          console.error("Error fetching chats:", error);
          toast.error("Failed to load chats. Please try again.");
        }
      );

      return () => unsubscribe();
    }
  }, [userData]);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value.trim();
      if (e.key === 'Enter' && input) { // Check if Enter key is pressed
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where('username', '==', input.toLowerCase()));
        const querySnap = await getDocs(q);
  
        if (querySnap.empty) {
          toast.info('User not available in the system');
          setUser(null);
        } else {
          const foundUser = querySnap.docs[0].data();
  
          if (foundUser.id !== userData.id) {
            const userExist = chatsData.some(chat => chat.rId === foundUser.id);
            if (!userExist) {
              setUser(foundUser);
            } else {
              setUser(null);
              toast.info('This user is already in your chat list'); // Only shows on Enter press
            }
          } else {
            setUser(null);
          }
        }
      } else if (!input) {
        setShowSearch(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error searching for user');
    }
  };
  

  const addChat = async () => {
    if (isAddingChat) return; // Prevent multiple additions
    setIsAddingChat(true); // Disable further clicks

    if (!user || !user.id || !user.avatar || !user.name) {
      toast.error('Invalid user data. Cannot add chat.');
      setIsAddingChat(false); // Re-enable adding if there's an error
      return;
    }

    // Check if the user is already in the chat list
    const userExist = chatsData.some(chat => chat.rId === user.id);
    if (userExist) {
      toast.info('This user is already in your chat list');
      setUser(null);
      setShowSearch(false);
      setIsAddingChat(false); // Re-enable after operation
      return;
    }

    const messageRef = collection(db, 'messages');
    const chatRef = doc(db, "chats", userData.id);

    try {
      const newMessageRef = doc(messageRef);
      await setDoc(newMessageRef, { createAt: serverTimestamp(), messages: [] });

      const newChatData = {
        messageId: newMessageRef.id,
        lastMessage: '',
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: {
          id: user.id,
          avatar: user.avatar,
          name: user.name
        }
      };

      await updateDoc(chatRef, {
        chatsData: arrayUnion(newChatData)
      });

      await updateDoc(doc(db, "chats", user.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: '',
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
          userData: {
            id: userData.id,
            avatar: userData.avatar,
            name: userData.name
          }
        })
      });

      setUser(null);
      setShowSearch(false);
      toast.success('Chat added successfully');
    } catch (error) {
      console.error('Error adding chat:', error);
      toast.error('Failed to add chat');
    } finally {
      setIsAddingChat(false); // Re-enable after operation completes
    }
  };

  const setChat = (item) => {
    if (item && item.messageId) {
      setMessageId(item.messageId);
      setChatUser(item);
    } else {
      toast.error('Invalid chat selected');
    }
  };

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
          <input onKeyDown={inputHandler} type="text" placeholder='Search here...' />
        </div>
      </div>

      <div className="left-side-list">
        {showSearch && user && user.avatar && user.name && !chatsData.some(chat => chat.rId === user.id) ? (
          <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar} alt={user.name} />
            <p>{user.name}</p>
          </div>
        ) : null}
        {chatsData.map((item, index) => (
          item && item.userData && item.userData.avatar && item.userData.name ? (
            <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messageId ? '' : 'border'}`}>
              <img src={item.userData.avatar} alt={item.userData.name} />
              <div>
                <p>{item.userData.name}</p>
                <span>{item.lastMessage || ''}</span>
              </div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;