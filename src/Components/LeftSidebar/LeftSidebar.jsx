// import './LeftSidebar.css'
// import assets from '../../assets/assets/'
// import { useNavigate } from 'react-router-dom'
// import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
// import { db } from '../../Config/Firebase'
// import { useContext, useState } from 'react'
// import { AppContext } from '../../Context/AppContext'
// import { toast } from 'react-toastify'


// const LeftSidebar = () => {
//   const navigate = useNavigate()
//   const { userData, chatsData = [] , chatUser, setChatUser, setMessageId, messageId } = useContext(AppContext);
//   const [user, setUser] = useState(null);
//   const [showSearch, setShowSearch] = useState(false);

//   const inputHandler = async (e) => {
//     try {
//       const input = e.target.value.trim();
//       console.log('Input value:', input); // Check if input is captured correctly
  
//       if (input) {
//         setShowSearch(true);
//         console.log('Fetching data for:', input); // Debug statement before querying
//         const userRef = collection(db, 'users');
//         const q = query(userRef, where('username', '==', input.toLowerCase()));
//         const querySnap = await getDocs(q);
  
//         if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
//           let userExist = false;

//           chatsData.map((user) => {
//             if (user.rId === querySnap.docs[0].data().id) {
//               userExist = true;
//             }
//           });

//           if (!userExist) {
//             setUser(querySnap.docs[0].data());
//           }
          
//         } else {
//           setUser(null); 
//         }
//       } else {
//         setShowSearch(false);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error); // Optional: log the error
//     }
//   };
  
//   const addChat = async () => {
//     const messageRef = collection(db, 'messages');
//     const chatRef = collection(db, "chats");

//     try {
//       const newMessageRef = doc(messageRef);
//       await setDoc(newMessageRef, { createAt: serverTimestamp(), messages: [] })

//       await updateDoc(doc(chatRef, user.id), {
//         chatsData: arrayUnion({
//           messageId: newMessageRef.id,
//           lastMessage: '',
//           rId: userData.id,
//           updatedAt: Date.now(),
//           messageSeen: true
//         })
//       });

//       await updateDoc(doc(chatRef, userData.id), {
//         chatsData: arrayUnion({
//           messageId: newMessageRef.id,
//           lastMessage: '',
//           rId: user.id,
//           updatesAt: Date.now(),
//           messageSeen: true
//         })
//       });

//     }
//     catch (error) {
//       console.log(error);
//       toast.error(error.message);
//     }
//   }

//   const setChat = async (item) => {
//     console.log('Selected chat data:', item) 
//     setMessageId(item.messageId);
//     setChatUser(item);
//   }

//   return (
//     <div className='left-side'>
//       <div className="left-side-top">
//         <div className="left-side-nav">
//           <img src={assets.logo} alt="logo" className='logo' />
//           <div className="menu">
//             <img src={assets.menu_icon} alt="" />

//             <div className='sub-menu'>
//               <p onClick={() => navigate('/profileUpdate')}>Edit profile</p>
//               <hr />
//               <p>Logout</p>
//             </div>
//           </div>
//         </div>
//         <div className="left-side-search">
//           <img src={assets.search_icon} alt="" />
//           <input onChange={inputHandler} type="text" placeholder='Search here' />
//         </div>
//       </div>

//       <div className="left-side-list">
//         {showSearch && user ? 
//           <div onClick={addChat} className='friends add-user'>
//             <img src={user.avatar} alt="" />
//             <p> {user.name} </p>
//           </div>
//          :  chatsData.map((item, index) => (
//             <div onClick={() => setChat(item)} key={index} className="friends">
//               <img src={item.userData.avatar} alt="" />
//               <div>
//                 <p>{item.userData.name}</p>
//                 <span>{item.lastMessage}</span>
//               </div>
//             </div>
//           ))
//         }
//       </div>
//     </div>
//   );
// }

// export default LeftSidebar;

// import { useContext, useState, useEffect } from 'react';
// import './LeftSidebar.css';
// import assets from '../../assets/assets/';
// import { useNavigate } from 'react-router-dom';
// import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
// import { db } from '../../Config/Firebase';
// import { AppContext } from '../../Context/AppContext';
// import { toast } from 'react-toastify';

// const LeftSidebar = () => {
//   const navigate = useNavigate();
//   const { userData, chatsData, setChatUser, setMessageId } = useContext(AppContext);
//   const [user, setUser] = useState(null);
//   const [showSearch, setShowSearch] = useState(false);
//   const [localChatsData, setLocalChatsData] = useState([]);

//   useEffect(() => {
//     // Load chats from local storage on component mount
//     const storedChats = JSON.parse(localStorage.getItem('chatsData') || '[]');
//     setLocalChatsData(storedChats);
//   }, [chatsData]);

//   useEffect(() => {
//     // Update local storage whenever localChatsData changes
//     localStorage.setItem('chatsData', JSON.stringify(localChatsData));
//   }, [localChatsData]);

//   const inputHandler = async (e) => {
//     try {
//       const input = e.target.value.trim();
//       if (input) {
//         setShowSearch(true);
//         const userRef = collection(db, 'users');
//         const q = query(userRef, where('username', '==', input.toLowerCase()));
//         const querySnap = await getDocs(q);

//         if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
//           const foundUser = querySnap.docs[0].data();
//           // Check if the user is already in localChatsData
//           const userExist = localChatsData.some(chat => chat.rId === foundUser.id);
//           if (!userExist) {
//             setUser(foundUser);
//           } else {
//             setUser(null);
//             toast.info('This user is already in your chat list');
//           }
//         } else {
//           setUser(null);
//         }
//       } else {
//         setShowSearch(false);
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       toast.error('Error searching for user');
//     }
//   };

//   const addChat = async () => {
//     if (!user) return;

//     const messageRef = collection(db, 'messages');
//     const chatRef = collection(db, "chats");

//     try {
//       const newMessageRef = doc(messageRef);
//       await setDoc(newMessageRef, { createAt: serverTimestamp(), messages: [] });

//       const newChatData = {
//         messageId: newMessageRef.id,
//         lastMessage: '',
//         rId: user.id,
//         updatedAt: Date.now(),
//         messageSeen: true,
//         userData: user
//       };

//       await updateDoc(doc(chatRef, userData.id), {
//         chatsData: arrayUnion(newChatData)
//       });

//       await updateDoc(doc(chatRef, user.id), {
//         chatsData: arrayUnion({
//           messageId: newMessageRef.id,
//           lastMessage: '',
//           rId: userData.id,
//           updatedAt: Date.now(),
//           messageSeen: true,
//           userData: userData
//         })
//       });

//       setLocalChatsData(prevChats => [...prevChats, newChatData]);
//       setUser(null);
//       setShowSearch(false);
//       toast.success('Chat added successfully');
//     } catch (error) {
//       console.error('Error adding chat:', error);
//       toast.error('Failed to add chat');
//     }
//   };

//   const setChat = (item) => {
//     setMessageId(item.messageId);
//     setChatUser(item);
//   };

//   return (
//     <div className='left-side'>
//       <div className="left-side-top">
//         <div className="left-side-nav">
//           <img src={assets.logo} alt="logo" className='logo' />
//           <div className="menu">
//             <img src={assets.menu_icon} alt="" />
//             <div className='sub-menu'>
//               <p onClick={() => navigate('/profileUpdate')}>Edit profile</p>
//               <hr />
//               <p>Logout</p>
//             </div>
//           </div>
//         </div>
//         <div className="left-side-search">
//           <img src={assets.search_icon} alt="" />
//           <input onChange={inputHandler} type="text" placeholder='Search here' />
//         </div>
//       </div>

//       <div className="left-side-list">
//         {showSearch && user ? (
//           <div onClick={addChat} className='friends add-user'>
//             <img src={user.avatar} alt="" />
//             <p>{user.name}</p>
//           </div>
//         ) : (
//           localChatsData.map((item, index) => (
//             <div onClick={() => setChat(item)} key={index} className="friends">
//               <img src={item.userData.avatar} alt="" />
//               <div>
//                 <p>{item.userData.name}</p>
//                 <span>{item.lastMessage}</span>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default LeftSidebar;

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
  const { userData, setChatUser, setMessageId } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [chatsData, setChatsData] = useState([]);

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
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where('username', '==', input.toLowerCase()));
        const querySnap = await getDocs(q);

        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          const foundUser = querySnap.docs[0].data();
          const userExist = chatsData.some(chat => chat.rId === foundUser.id);
          if (!userExist) {
            setUser(foundUser);
          } else {
            setUser(null);
            toast.info('This user is already in your chat list');
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error searching for user');
    }
  };

  const addChat = async () => {
    if (!user || !user.id || !user.avatar || !user.name) {
      toast.error('Invalid user data. Cannot add chat.');
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
          <input onChange={inputHandler} type="text" placeholder='Search here' />
        </div>
      </div>

      <div className="left-side-list">
        {showSearch && user && user.avatar && user.name ? (
          <div onClick={addChat} className='friends add-user'>
            <img src={user.avatar} alt={user.name} />
            <p>{user.name}</p>
          </div>
        ) : null}
        {chatsData.map((item, index) => (
          item && item.userData && item.userData.avatar && item.userData.name ? (
            <div onClick={() => setChat(item)} key={index} className="friends">
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