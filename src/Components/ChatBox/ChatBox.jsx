import './ChatBox.css'
import assets from '../../assets/assets/'

const ChatBox = () => {
  return (
    <div className='chat-box-container'>
      <div className="chat-user">
        <img src={assets.profile_img} alt="" />
        <p>Hamza Sheikh <img className='dot' src={assets.green_dot} alt="" /></p>
        <img src={assets.help_icon} className='help' alt="" />
      </div>
{/* sending & receiving msg */}
      <div className="chat-message">
        <div className="sender-message">
          <p className='message'>hello, this is hamza</p>
          <div>
            <img src={assets.profile_img} alt="" />
            <p>2:30pm</p>
          </div>
        </div>

        <div className="receiver-message">
          <p className='message'>hello, this is hamza</p>
          <div>
            <img src={assets.profile_img} alt="" />
            <p>2:30pm</p>
          </div>
        </div>

      </div>

      <div className="chat-input">
        <input type="text" placeholder='send a message' />
        <input type="file" id='image' accept='image/png , image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img src={assets.send_button} alt="" />
      </div>
    </div>
  )
}

export default ChatBox
