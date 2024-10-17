// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, Timestamp, setDoc, getDoc, doc, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { getStorage } from "firebase/storage";
import { collection, query, where } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPAqpos96MLmKLPLyAQNLx7O-pOnneHgM",
  authDomain: "chat-application-cf9cf.firebaseapp.com",
  projectId: "chat-application-cf9cf",
  storageBucket: "chat-application-cf9cf.appspot.com",
  messagingSenderId: "860822686929",
  appId: "1:860822686929:web:8b04ff6bd775f18a2e49f0",
  measurementId: "G-JV35K9VTES"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage();

export async function storeTimestamp(userId) {
  const userRef = doc(db, 'users', userId);
  const now = Timestamp.now();

  await setDoc(userRef, { lastSeen: now }, { merge: true });
}

// Function to retrieve and format timestamp
export async function getFormattedTimestamp(userId) {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const lastSeen = docSnap.data().lastSeen;
    const date = lastSeen.toDate();

    const formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC',
      hour12: false
    });

    return `Date: ${formattedDate} UTC`;
  } else {
    return "No timestamp found";
  }
}



// Function to sign up a new user

const signup = async (username, email, password) => {

  try {
    // Check if username already exists
    const usernameQuery = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
    const usernameSnapshot = await getDocs(usernameQuery);

    // Check if the query returned any results
    if (!usernameSnapshot.empty) {
      toast.error("Username already in use.");
      return;
    }

    // Create user with email and password
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Save user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      password: password,
      name: '',
      avatar: '',
      bio: 'Hey, there I am using chat app',
      lastSeen: Date.now()
    });

    // Create empty chat data for the user
    await setDoc(doc(db, 'chats', user.uid), {
      chatData: [],
    });

    toast.success("User created successfully!");

  }


  catch (error) {
    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      toast.error("This email is already in use.");
    } else if (error.code === 'auth/invalid-email') {
      toast.error("The email address is not valid.");
    } else if (error.code === 'auth/weak-password') {
      toast.error("The password is too weak.");
    } else {
      toast.error("An error occurred. Please try again.");
    }
    console.error("Error during signup:", error);
  }
};

// Function to log in a user
const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    toast.success("Logged in successfully!");
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      toast.error("No user found with this email.");
    } else if (error.code === 'auth/wrong-password') {
      toast.error("Wrong password.");
    } else {
      toast.error("An error occurred during login.");
    }
    console.error("Error during login:", error);
  }
};

const logout = async () => {
  try {
    await signOut(auth)
  }
  catch (error) {
    toast.error("An error occurred while logging out.");
    console.error("Error during logout:", error);
  }
}

const resetPassword = async (email) => {
  if (!email) {
    toast.error("Please Enter a valid email");
    return null;
  }

  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where('email', '==', email));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent successfully. Please check your inbox.");
    }
    else {
      toast.error("No user found with this email.");
    }
  } catch (error) {
    console.error(error)
    toast.error(error.message);
  }
}

export { signup, auth, logout, login, db, resetPassword };
