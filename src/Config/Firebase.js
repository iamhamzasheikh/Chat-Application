// firebase.js
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  Timestamp,
  setDoc,
  getDoc,
  getDocs,
  doc,
  collection,
  query,
  where
} from "firebase/firestore";
import { toast } from "react-toastify";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBPAqpos96MLmKLPLyAQNLx7O-pOnneHgM",
  authDomain: "chat-application-cf9cf.firebaseapp.com",
  projectId: "chat-application-cf9cf",
  storageBucket: "chat-application-cf9cf.appspot.com",
  messagingSenderId: "860822686929",
  appId: "1:860822686929:web:8b04ff6bd775f18a2e49f0",
  measurementId: "G-JV35K9VTES"
};

// Initialize Firebase once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage(app);

// Improved timestamp functions
export async function storeTimestamp(userId) {
  if (!userId) return;
  
  try {
    await setDoc(doc(db, 'users', userId), {
      lastSeen: Timestamp.now(),
      isOnline: true
    }, { merge: true });
  } catch (error) {
    console.error("Error updating timestamp:", error);
  }
}

export async function getFormattedTimestamp(userId) {
  if (!userId) return "No timestamp available";

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return "No timestamp found";

    const lastSeen = userDoc.data().lastSeen;
    if (!lastSeen) return "No timestamp available";

    return lastSeen.toDate().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error("Error getting timestamp:", error);
    return "Error retrieving timestamp";
  }
}

// Enhanced Google Sign In
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Generate unique username
      let username = user.email.split('@')[0].toLowerCase();
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
      }

      // Create new user
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email,
        username: username,
        name: user.displayName || '',
        avatar: user.photoURL || '',
        bio: `Hey there! I'm ${user.displayName} using chat app`,
        lastSeen: Timestamp.now(),
        createdAt: Timestamp.now(),
        isOnline: true,
        authProvider: 'google'
      });

      // Initialize empty chats
      await setDoc(doc(db, 'chats', user.uid), {
        chatData: [],
        lastUpdated: Timestamp.now()
      });

      toast.success("Account created successfully!");
    } else {
      await storeTimestamp(user.uid);
      toast.success("Welcome back!");
    }

    return user;
  } catch (error) {
    console.error("Google sign in error:", error);
    const errorMessage = {
      'auth/popup-closed-by-user': 'Sign in cancelled.',
      'auth/popup-blocked': 'Please allow popups and try again.',
      'auth/cancelled-popup-request': 'Sign in cancelled.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    }[error.code] || "Error signing in with Google. Please try again.";
    
    toast.error(errorMessage);
    return null;
  }
};

// Enhanced GitHub Sign In
export const signInWithGithub = async () => {
  try {
    const provider = new GithubAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Generate unique username
      let username = user.displayName ? 
        user.displayName.toLowerCase().replace(/\s+/g, '') : 
        `github_user_${Math.floor(Math.random() * 10000)}`;
      
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        username = `${username}${Math.floor(Math.random() * 1000)}`;
      }

      // Create new user
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: user.email || '',
        username: username,
        name: user.displayName || username,
        avatar: user.photoURL || '',
        bio: `Hey there! I'm ${user.displayName || username} using chat app`,
        lastSeen: Timestamp.now(),
        createdAt: Timestamp.now(),
        isOnline: true,
        authProvider: 'github'
      });

      // Initialize empty chats
      await setDoc(doc(db, 'chats', user.uid), {
        chatData: [],
        lastUpdated: Timestamp.now()
      });

      toast.success("Account created successfully!");
    } else {
      await storeTimestamp(user.uid);
      toast.success("Welcome back!");
    }

    return user;
  } catch (error) {
    console.error("GitHub sign in error:", error);
    const errorMessage = {
      'auth/popup-closed-by-user': 'Sign in cancelled.',
      'auth/popup-blocked': 'Please allow popups and try again.',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email.',
      'auth/cancelled-popup-request': 'Sign in cancelled.',
      'auth/network-request-failed': 'Network error. Please check your connection.'
    }[error.code] || "Error signing in with GitHub. Please try again.";
    
    toast.error(errorMessage);
    return null;
  }
};



// Enhanced signup with validation
const signup = async (username, email, password) => {
  if (!username || !email || !password) {
    toast.error("All fields are required");
    return null;
  }

  try {
    // Check username availability
    const usernameQuery = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const usernameSnapshot = await getDocs(usernameQuery);

    if (!usernameSnapshot.empty) {
      toast.error("Username already taken");
      return null;
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    // Create user profile
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: username,
      avatar: '',
      bio: 'Hey, there I am using chat app',
      lastSeen: Timestamp.now(),
      createdAt: Timestamp.now(),
      isOnline: true,
      authProvider: 'email'
    });

    // Initialize chats
    await setDoc(doc(db, 'chats', user.uid), {
      chatData: [],
      lastUpdated: Timestamp.now()
    });

    toast.success("Account created successfully!");
    return user;
  } catch (error) {
    const errorMessage = {
      'auth/email-already-in-use': 'Email already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/weak-password': 'Password should be at least 6 characters'
    }[error.code] || "Signup failed. Please try again.";
    
    toast.error(errorMessage);
    return null;
  }
};

// Improved login with status update
const login = async (email, password) => {
  if (!email || !password) {
    toast.error("Email and password are required");
    return null;
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await storeTimestamp(result.user.uid);
    toast.success("Logged in successfully!");
    return result.user;
  } catch (error) {
    const errorMessage = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address'
    }[error.code] || "Login failed. Please try again.";
    
    toast.error(errorMessage);
    return null;
  }
};

// Enhanced logout with status update
const logout = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (userId) {
      await setDoc(doc(db, 'users', userId), {
        lastSeen: Timestamp.now(),
        isOnline: false
      }, { merge: true });
    }
    await signOut(auth);
    toast.success("Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    toast.error("Logout failed. Please try again.");
  }
};

// Improved password reset
const resetPassword = async (email) => {
  if (!email) {
    toast.error("Email is required");
    return false;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    toast.success("Password reset email sent");
    return true;
  } catch (error) {
    const errorMessage = {
      'auth/user-not-found': 'No account found with this email',
      'auth/invalid-email': 'Invalid email address'
    }[error.code] || "Password reset failed. Please try again.";
    
    toast.error(errorMessage);
    return false;
  }
};

// Auth state observer
export const setupAuthObserver = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      await storeTimestamp(user.uid);
    }
    callback(user);
  });
};

export {
  signup,
  auth,
  logout,
  login,
  db,
  resetPassword,
  getAuth
};