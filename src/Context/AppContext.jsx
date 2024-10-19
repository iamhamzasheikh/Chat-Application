import { createContext, useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { auth, db } from "../Config/Firebase";
import { useNavigate } from "react-router-dom";
export const AppContext = createContext();

const AppContextProvider = (props) => {

    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messageId, setMessageId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible, setChatVisible] = useState(false);  // New state for mobile view

    const loadUserData = async (uid) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            setUserData(userData);

            if (userData.avatar && userData.name) {
                navigate('/chat');
            }
            else {
                navigate('/ProfileUpdate');
            }

            await updateDoc(userRef, {
                lastSeen: Date.now()
            })
            setInterval(async () => {
                if (auth.chatUser) {
                    await updateDoc(userRef, {
                        lastSeen: Date.now()
                    })
                }
            }, 60000);
        }
        catch (error) {
            console.error("Error getting document:", error);
        }
    }

    useEffect(() => {
        if (userData) {
            const chatRef = doc(db, 'chats', userData.id);
            const unSub = onSnapshot(chatRef, async (res) => {
                const chatItems = res.data().chatData;
                // console.log(chatItems);
                const tempData = [];
                for (const chatItem of chatItems) {
                    const userRef = doc(db, 'users', chatItem.rid);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.data();
                    tempData.push({ ...chatItem, user: userData });
                }
                setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
            })
            return () => {
                unSub();
            }
        }
    }, [userData])

    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messageId, setMessageId,
        chatUser, setChatUser,
        chatVisible,
        setChatVisible
    }


    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}
export default AppContextProvider;