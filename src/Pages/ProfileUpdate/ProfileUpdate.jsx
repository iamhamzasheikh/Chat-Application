import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { useState } from 'react'

const ProfileUpdate = () => {
  const [image, setImage] = useState(false);


  return (
    <div className='profile-update-main-container'>
      <div className="profile-inner-container">
        <form>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e)=>setImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
            <img src={image?URL.createObjectURL(image):assets.avatar_icon} alt="" />
            uplord image
          </label>
          <input type="text" placeholder='Enter you name' required />
          <textarea placeholder='write profile bio' required></textarea>
          <button type='submit'>save</button>
        </form>
        <img className='profile-pic' src={image?URL.createObjectURL(image): assets.logo_icon} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate
