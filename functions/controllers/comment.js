const { FieldValue, Timestamp } = require("firebase-admin/firestore")
const { db } = require("../config/admin")


const commentRef=db.collection('comments')
const shoutsRef=db.collection('shouts')
async function createCommentHanlder(req,res) {
    try {
        //create new comment
        let {content,shoutId}=req.body
        let {uid}=req.user
        if(!content || !shoutId) throw Error('Invalid Credentals')
        content=content.trim()
        let response=await commentRef.add({
            content,shoutId,
            author:uid,
            createdAt:Timestamp.now()
        })
        //increase the comment count of relavent shout
        await shoutsRef.doc(shoutId).update({
            commentsCount:FieldValue.increment(1)
        })
        

        res.status(201).json({
            success:true,
            message:`New Comment added with id ${response.id}`
        })

    } catch (error) {
        console.error(error)
        res.status(403).json({
            success:false,
            error: error.message,
          });
    }
}
async function editCommentHanlder(req,res) {
    try {
        //create new comment
        let {content}=req.body
        let {id}=req.params
        if(!content || !id ) throw Error('Invalid Credentals')
        content=content.trim()
        let response=await commentRef.doc(id).update({
            content,
            createdAt:Timestamp.now()
        })
        res.status(202).json({
            success:true,
            message:`New Comment updated with id ${response.id}`
        })

    } catch (error) {
        console.error(error)
        res.status(403).json({
            success:false,
            error: error.message,
          });
    }
}


async function deleteCommentHanlder(req,res) {
    try {
        //create new comment
        let {shoutId}=req.body
        let {id}=req.params
        if(!id || !shoutId ) throw Error('Invalid Credentals')
        //check if comment exits
        const snapshot=await commentRef.doc(id).get()
        if(!snapshot.exists) throw Error('No Such Comment exists!')
        await commentRef.doc(id).delete()
        //decrement the comment count
        await shoutsRef.doc(shoutId).update({
            commentsCount:FieldValue.increment(-1)
        })
        res.status(202).json({
            success:true,
            message:`Comment deleted`,
        })

    } catch (error) {
        console.error(error)
        res.status(403).json({
            success:false,
            error: error.message,
          });
    }
}
module.exports={createCommentHanlder,editCommentHanlder,deleteCommentHanlder}