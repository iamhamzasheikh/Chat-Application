import './ProfileUpdate.css'
import assets from '../../assets/assets'
import { useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../Config/Firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import upload from '../../Lib/Uplord';
import { AppContext } from '../../Context/AppContext';

const ProfileUpdate = () => {
  const navigate = useNavigate()

  const [image, setImage] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [uid, setUid] = useState('');
  const [prevImage, setPrevImage] = useState('');
  const { setUserData } = useContext(AppContext)


  const profileUpdate = async (event) => {
    event.preventDefault();
    
    try {
      if (!prevImage && !image) {
        toast.error('Please upload a profile image');
        return;
      }
  
      const docRef = doc(db, 'users', uid);
  
      if (image) {
        // This will now show progress via toast
        const imgURL = await upload(image);
        setPrevImage(imgURL);
        await updateDoc(docRef, {
          avatar: imgURL,
          bio: bio,
          name: name,
        });
      } else {
        await updateDoc(docRef, {
          bio: bio,
          name: name,
        });
      }
  
      const snap = await getDoc(docRef);
      setUserData(snap.data());
      navigate('/chat');
  
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message);
    }
  }

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
        <form onSubmit={profileUpdate} >
          <h3>Profile Details</h3>
          <label htmlFor="avatar">
            <input onChange={(e) => setImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
            <img src={image ? URL.createObjectURL(image) : (prevImage || assets.avatar_icon)} alt="" />
            Upload image
          </label>
          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Enter your name' required />
          <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='Write profile bio' required></textarea>
          <button onSubmit={handleSubmit} type='submit'>Save</button>
        </form>
        <img className='profile-pic' src={image ? URL.createObjectURL(image) : (prevImage ? prevImage : assets.logo_icon)} alt="" />
      </div>
    </div>
  )
}

export default ProfileUpdate