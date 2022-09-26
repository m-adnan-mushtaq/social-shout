
 const { Timestamp } = require("firebase-admin/firestore")
const { db } = require("../config/admin")
 const shoutsRef=db.collection('shouts')
 const notificationsRef=db.collection('notifications')


/**
 * Triggers send notification to user, whenever someone liked his post
 * @param {*} snap // snap of document whose on creating function is triggering
 * @param {*} context  //context is just a copy of req object , you can access here context.params.docId
 */

async function sendLikeNotification(snap,context) {
    try {
        let doc=snap.data()
        console.log('like trigger =>',doc);
        // find specific shout 
        let shoutSnapShot=await shoutsRef.doc(doc.shoutId).get()
        if(!shoutSnapShot.exists) throw Error('Shout does not exist!')

        //otherwise create notification and send it to shout author
        await notificationsRef.doc(snap.id).set({
            sender:doc.author,
            recipient:shoutSnapShot.data().author,
            type:'like',
            read:false,
            createdAt:Timestamp.now(),
            shoutId:doc.shoutId
        })

    } catch (error) {
        console.error(error)
    }
}


async function deleteLikeNotification(snap,context) {
    try {
        //otherwise create notification and send it to shout author
        await notificationsRef.doc(snap.id).delete()
    } catch (error) {
        console.error(error)
    }
}

module.exports={sendLikeNotification,deleteLikeNotification}