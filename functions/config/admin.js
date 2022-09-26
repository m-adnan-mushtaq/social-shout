//------------firebase admin-----------------
const admin = require("firebase-admin");
const serviceAccount = require("../../serviceAccountKey.json");
const {getFirestore}=require('firebase-admin/firestore')


//----------- firebase client----------------
const {initializeApp}=require('firebase/app')
const { getAuth} = require("firebase/auth");
const {getStorage}=require('firebase/storage')

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};


// ----------Initialize Firebase Client-------
const app=initializeApp(firebaseConfig)
const auth=getAuth(app)
const storage=getStorage(app)
//------- Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:process.env.FIREBASE_STORAGE_BUCKET
});
//-----------firebase admin database--------
const db=getFirestore()
db.settings({
  ignoreUndefinedProperties:true
})


module.exports={admin,db,auth,storage}