const { FieldValue } = require("firebase-admin/firestore")
const { db } = require("../config/admin")


const likesRef=db.collection('likes')
const shoutsRef=db.collection('shouts')
async function likeDislikeHandler(req,res) {
    try {
        //like and dislike
        let {shoutId}=req.body
        let {uid}=req.user
        if(!shoutId) throw Error('Invalid Credentals')

        let likeSnap=await likesRef.where('author','==',uid).where('shoutId','==',shoutId).get()

        let isLiked=likeSnap.empty
        //if like does not exist create it otherwise remove it
        if(isLiked){
            await likesRef.add({
                author:uid,
                shoutId,
            })
        }else{
            await likesRef.doc(likeSnap.docs[0].id).delete()
        }
        let incrmenter=isLiked?1:-1
        //update the like count of relavent shout
        await shoutsRef.doc(shoutId).update({
            likesCount:FieldValue.increment(incrmenter)
        })
        

        res.status(204).send();

    } catch (error) {
        console.error(error)
        res.status(403).json({
            success:false,
            error: error.message,
          });
    }
}
module.exports={likeDislikeHandler}