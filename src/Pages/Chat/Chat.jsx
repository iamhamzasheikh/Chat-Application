// Chat.jsx
import { useContext, useEffect, useState } from 'react';
import './Chat.css';
import LeftSidebar from '../../Components/LeftSidebar/LeftSidebar';
import RightSidebar from '../../Components/RightSidebar/RightSidebar';
import ChatBox from '../../Components/ChatBox/ChatBox';
import { AppContext } from '../../Context/AppContext';

const Chat = () => {
    const { chatData, userData, chatVisible } = useContext(AppContext);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (chatData && userData) {
            setLoading(false);
        }
    }, [chatData, userData]);

    return (
        <div className="chat-main-container">
            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="chat-inner-container">
                    {/* Add 'visible' class when that component should be shown */}
                    <div className={`left-sidebar-container ${!chatVisible ? 'visible' : ''}`}>
                        <LeftSidebar />
                    </div>
                    <div className={`chat-box-container ${chatVisible ? 'visible' : ''}`}>
                        <ChatBox />
                    </div>
                    <div className="right-sidebar-container">
                        <RightSidebar />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;