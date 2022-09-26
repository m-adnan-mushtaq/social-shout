require("dotenv").config()

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const { sendLikeNotification, deleteLikeNotification } = require("./triggres/likeNotification");
const app = express();
app.use(express.urlencoded({ extended: false }))
app.use(express.json({ limit: '20mb' }))
app.use(cors())

//-------------   LET'S BUILD A SIMPLE FREIBASE REST API  -----------------------------

//----- global error handler--------------
app.use((err, req, res, next) => {
    if (err) {
        console.error(err.stack)
        console.error(err.message)
        res.status(500).json({
            message: 'Something broke!'
        })
    }else next()
})
//--------------------------👉 @auth route 🔐-------------------
app.use('/auth', require('./routes/auth'))

//---------------👉@ shouts/upload route 🌁----------------------
app.use('/shouts/upload', require('./routes/upload'))

//--------------------------👉 @shouts route 📑-------------------
app.use('/shouts', require('./routes/shouts'))


//--------------------------👉 @users route -------------------
app.use('/users', require('./routes/users'))

//-----------------------------👉 @comments route ----------------------
app.use('/comments',require('./routes/comment'))

//-----------------------------👉 @like route ----------------------
app.use('/like',require('./routes/like'))

exports.api = functions.region('asia-east1').https.onRequest(app)

// -----------------notifications triggers------------
//on like send notification
exports.sendLikeNotification=functions.region('asia-east1').firestore.document('like/{docId}').onCreate(sendLikeNotification)
//on dislike delete notification
exports.deleteLikeNotification=functions.region('asia-east1').firestore.document('like/{docId}').onDelete(deleteLikeNotification)


