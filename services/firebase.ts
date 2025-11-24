
// This tells TypeScript that the 'firebase' object exists on the global scope
declare var firebase: any;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-hVOze0viPVGrhpDmgXwIRRQLU8fdhIs",
  authDomain: "simulado-02-ale-ro.firebaseapp.com",
  projectId: "simulado-02-ale-ro",
  storageBucket: "simulado-02-ale-ro.firebasestorage.app",
  messagingSenderId: "226005457036",
  appId: "1:226005457036:web:d41acf443526586649c3a9",
  measurementId: "G-MTFGRWNVTJ"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service using the compat API
export const db = app.firestore();
