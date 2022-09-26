const { Timestamp } = require("firebase-admin/firestore");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail } = require("firebase/auth");
const { db, auth, admin } = require("../config/admin");


//----------- GLOBAL MIDDLEWARES DONT'T MODIFY IT------
const defaultFileKey=process.env.FIREBASE_DEFAULT_FILE_KEY
const defaultPicUrl=process.env.FIREBASE_DEFAULT_PIC_URL


async function signUpHandler(req, res) {
    try {
        const { email, password, username,name } = req.body
        let errors = validateCredentials({ email, password })

        if (!username) errors.username = 'Please fill username field!'

        //check if username is already taken or not by someone else
        const usersSnapShot = await db.collection('users').where('username','==',username).get()
        if(!usersSnapShot.empty) return

        if (!validityChecker(errors)) {
            res.status(403).json({ errors,credentialsError:true })
            return
        }

        // creat user into authentication
        const {user:{uid}}=await createUserWithEmailAndPassword(auth, email, password)
        //create user into userCollection
        await db.doc(`/users/${uid}`).create({
            username,email,name,authRef:uid,
            profilePic:defaultPicUrl,
            fileKey:defaultFileKey,
            createdAt:Timestamp.now()
        })
        //now send email verfication
        if (!auth.currentUser) throw Error('No Users found!')

        await sendEmailVerification(auth.currentUser)
        res.status(201).send({
            success: true,
            message: 'Verification Email has been sent,Check your inbox/spam folder!'
        })

    } catch (error) {
        console.log(error.message);

        res.status(403).json({ errors: { uncaughtError: error.message } })

    }
}

async function singInHandler(req,res) {
    try {
        const { email, password } = req.body
        let errors = validateCredentials({ email, password })
        if (!validityChecker(errors)) {
            res.status(403).json({ errors ,credentialsError:true})
            return
        }
        const response = await signInWithEmailAndPassword(auth, email, password)

        if(!response.user.emailVerified) throw Error('Your account has not been verified yet!, make sure to verify your account!')
        const token=await response.user.getIdToken(true)
        res.json({success:true,token })

    } catch (error) {
        console.log(error.message);

        res.status(403).json({ errors: { uncaughtError: error.message } })
    }
}

async function resetPasswordHandler(req,res) {
    try {
        const {email}=req.body
        //find user by email if user has created account or not
        if(!email || !emailValidator(email)) throw  Error('Please Enter a valid email')
        const fetchedUser=await admin.auth().getUserByEmail(email)
        if(!fetchedUser) throw Error("No User found with this email!")
        await sendPasswordResetEmail(auth,fetchedUser.email)
        res.json({
            success:true,
            message:'Password Reset Email has been sent, Check Your inbox/spam folder!'
        })
    } catch (error) {
        console.log(error.message);
        res.status(403).json({ error: error.message })
    }
    
}

// ------------ utils function---------------------
function validateCredentials(credentials) {
    const errors = {}
    const { email, password } = credentials
    if (!email) errors.email = 'Please Enter a valid email'
    if (!password) errors.password = 'Please fill password field!'
    if (email && !emailValidator(email)) errors.email = 'Please Enter a valid email <example@gmail.com>'
    if (password && password.length < 6) errors.password = 'Password is too short! minimu 6 Characters!'
    return errors
}

function emailValidator(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
function validityChecker(errors) {
    return Object.keys(errors).length === 0
}

module.exports={signUpHandler,singInHandler,resetPasswordHandler}