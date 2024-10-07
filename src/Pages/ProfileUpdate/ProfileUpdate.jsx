import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../Config/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const ProfileUpdate = () => {
  const navigate = useNavigate()

  const [image, setImage] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [uid, setUid] = useState('');
  const [prevImage, setPrevImage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) setName(data.name);
          if (data.bio) setBio(data.bio);
          if (data.avatar) setPrevImage(data.avatar);
        }
      } else {
        navigate('/')
      }
    })

    return () => unsubscribe();
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your form submission logic here
  }

  return (
    <div className='profile-update-main-container'>
      <div className="profile-inner-container">
        <form onSubmit={handleSubmit}>
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
            <img src={image ? URL.createObjectURL(image) : (prevImage || assets.avatar_icon)} alt="" />
            Upload image
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Enter your name' required />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='Write profile bio' required></textarea>
          <button type='submit'>Save</button>
        </form>
        <img className='profile-pic' src={image ? URL.createObjectURL(image) : (prevImage || assets.logo_icon)} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate