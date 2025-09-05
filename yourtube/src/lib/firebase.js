// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAgXZKw_ceUaWa_GDRnlpz9DeHbEiROJpI",
    authDomain: "yourtube-internship.firebaseapp.com",
    projectId: "yourtube-internship",
    storageBucket: "yourtube-internship.firebasestorage.app",
    messagingSenderId: "792243458658",
    appId: "1:792243458658:web:51d8627deaa343e0a0773b",
    measurementId: "G-K7P4XEP8YC"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth, provider };
