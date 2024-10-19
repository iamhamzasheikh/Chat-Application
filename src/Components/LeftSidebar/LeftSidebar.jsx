import { useContext, useState, useEffect } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets/';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, onSnapshot, getDoc } from 'firebase/firestore';
import { db, logout } from '../../Config/Firebase';
import { AppContext } from '../../Context/AppContext';
import { toast } from 'react-toastify';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData, setChatUser, setMessageId, messageId,  chatVisible, setChatVisible } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [chatsData, setChatsData] = useState([]);
  const [isAddingChat, setIsAddingChat] = useState(false);
  const [newMessageChats, setNewMessageChats] = useState({});
  const [selectedUserData, setSelectedUserData] = useState({
    name: '',
    avatar: '',
  });
  
  useEffect(() => {
    if (userData && userData.id) {
      const chatRef = doc(db, "chats", userData.id);
      const unsubscribe = onSnapshot(
        chatRef,
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const validChats = (data.chatsData || []).filter(chat => 
              chat && chat.userData && chat.userData.avatar && chat.userData.name
            );
  
            // Fetch latest user data for each chat
            const chatsWithUpdatedData = await Promise.all(
              validChats.map(async (chat) => {
                // Get latest user data
                const userRef = doc(db, 'users', chat.rId);
                try {
                  const userSnap = await getDoc(userRef);
                  if (userSnap.exists()) {
                    const latestUserData = userSnap.data();
                    // Update only name and avatar
                    return {
                      ...chat,
                      userData: {
                        ...chat.userData,
                        name: latestUserData.name || chat.userData.name,
                        avatar: latestUserData.avatar || chat.userData.avatar
                      }
                    };
                  }
                } catch (error) {
                  console.error("Error fetching user data:", error);
                }
                return chat;
              })
            );
  
            // Sort chats by updatedAt (latest first)
            chatsWithUpdatedData.sort((a, b) => b.updatedAt - a.updatedAt);
  
            setChatsData(chatsWithUpdatedData);
  
            // Check for new messages (keeping existing functionality)
            const newMessageChatsUpdate = {};
            chatsWithUpdatedData.forEach(chat => {
              if (!chat.messageSeen && chat.messageId !== messageId) {
                newMessageChatsUpdate[chat.messageId] = true;
              }
            });
            setNewMessageChats(newMessageChatsUpdate);
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
  }, [userData, messageId]);
  

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
          setSelectedUserData({ name: '', avatar: '' }); // Clear selected user data
        } else {
          const foundUser = querySnap.docs[0].data();
          if (foundUser.id !== userData.id) {
            const userExist = chatsData.some(chat => chat.rId === foundUser.id);
            if (!userExist) {
              setUser(foundUser);
              // Set selected user data with found user's name and avatar
              setSelectedUserData({
                name: foundUser.name,
                avatar: foundUser.avatar,
              });
            } else {
              setUser(null);
              setSelectedUserData({ name: '', avatar: '' }); // Clear selected user data
              toast.info('This user is already in your chat list'); // Only shows on Enter press
            }
          } else {
            setUser(null);
            setSelectedUserData({ name: '', avatar: '' }); // Clear selected user data
          }
        }
      } else if (!input) {
        setShowSearch(false);
        setUser(null);
        setSelectedUserData({ name: '', avatar: '' }); // Clear selected user data
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error searching for user');
    }
  };
  

  const addChat = async () => {
    if (isAddingChat) return;
    setIsAddingChat(true);

    if (!user || !user.id || !user.avatar || !user.name) {
      toast.error('Invalid user data. Cannot add chat.');
      setIsAddingChat(false);
      return;
    }

    const userExist = chatsData.some(chat => chat.rId === user.id);
    if (userExist) {
      toast.info('This user is already in your chat list');
      setUser(null);
      setShowSearch(false);
      setIsAddingChat(false);
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
      setIsAddingChat(false);
    }
  };

  const setChat = (item) => {
    if (item && item.messageId) {
      setMessageId(item.messageId);
      setChatUser(item);
      setChatVisible(true);
      // Remove highlight when opening the chat
      setNewMessageChats(prev => ({...prev, [item.messageId]: false}));

      // Update messageSeen status in Firestore
      updateMessageSeenStatus(item.messageId);
    } else {
      toast.error('Invalid chat selected');
    }
  };

  const updateMessageSeenStatus = async (messageId) => {
    if (userData && userData.id) {
      const chatRef = doc(db, "chats", userData.id);
      try {
        await updateDoc(chatRef, {
          chatsData: chatsData.map(chat => 
            chat.messageId === messageId ? { ...chat, messageSeen: true } : chat
          )
        });
      } catch (error) {
        console.error("Error updating message seen status:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');  // Navigate back to login page after successful logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  return (
    <div className={`left-side ${chatVisible ? 'hidden' : ''}`}>
      <div className="left-side-top">
        <div className="left-side-nav">
          <img src={assets.logo} alt="logo" className='logo' />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className='sub-menu'>
              <p onClick={() => navigate('/profileUpdate')}>Edit profile</p>
              <hr />
              <p onClick={handleLogout}>Logout</p>
            </div>
          </div>
        </div>
        <div className="left-side-search">
          <img src={assets.search_icon} alt="" />
          <input onKeyDown={inputHandler} type="text" placeholder='Search here...' />
        </div>
      </div>

      <div className="left-side-list">
      {showSearch && user && selectedUserData.avatar && selectedUserData.name && !chatsData.some(chat => chat.rId === user.id) ? (
  <div onClick={addChat} className='friends add-user'>
    <img src={selectedUserData.avatar} alt={selectedUserData.name} />
    <p>{selectedUserData.name}</p>
  </div>
) : null}
        {chatsData.map((item, index) => (
          item && item.userData && item.userData.avatar && item.userData.name ? (
            <div 
              onClick={() => setChat(item)} 
              key={index} 
              className={`friends ${newMessageChats[item.messageId] ? 'new-message' : ''}`}
            >
              <img src={item.userData.avatar} alt={item.userData.name} />
              <div>
                <p className={newMessageChats[item.messageId] ? 'new-message-text' : ''}>{item.userData.name}</p>
                <span className={`last-msg ${newMessageChats[item.messageId] ? 'new-message-text' : ''}`}>
                  {item.lastMessage || ''}
                </span>
              </div>
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;