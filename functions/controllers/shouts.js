const { Timestamp } = require("firebase-admin/firestore");
const { shoutsPaginationUtil, commentsPaginationUtil} = require("../utils/pagination");
const {  populateAuthorHelper } = require("../utils/utils");

const { db } = require("../config/admin");

const shoutsRef = db.collection("shouts");

async function fetchShoutsHanlder(req, res) {
  try {
    // let's fetch all shouts from firebase
    if (!req.user) throw Error("Unathorized Request");
    let currentPage = parseInt(req.query.page) || 1
    const resObj = await shoutsPaginationUtil(currentPage)
    res.json(resObj);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
}


//enctype should  be application/json to extract the urls array
async function createShoutHandler(req, res) {
  try {
    const { content } = req.body;
    const { uid } = req.user
    if (!content || !uid) throw Error("invalid credentials!");
    //create new shout
    const response = await shoutsRef.add({
      content,
      createdAt: Timestamp.now(),
      likesCount: 0,
      commentsCount: 0,
      author:uid
    });
    res.status(201).json({
      success: true,
      message: `Document created with id ${response.id}`
    });
  } catch (error) {
    console.log(error);
    res.status(403).send({
      success: false,
      error: error.message,
    });
  }
}

async function getSpecificShout(req, res) {
  try {
    const docId = req.params.id;
    // const { uid } = req.user
    // if (!docId || !uid) throw Error("invalid credentials!");

    const response = await shoutsRef.doc(docId).get();
    if (!response.exists) throw Error('No such shout exists!')
    //TODO: also get shouts comments ❌👈
    let foundShout=await populateAuthorHelper(response)
    res.json(foundShout);

  } catch (error) {
    console.log(error);
    res.status(400).send({
      error: error.message,
    });
  }
}

async function deleteSpecificShoutHanlder(req, res) {
  try {
    const docId = req.params.id;
    if (!docId) throw Error("invalid credentials!");

    //make sure that delete req sender is actual author
    const docRef = shoutsRef.doc(docId)
    const targetShout = await docRef.get()

    //mak sure he is the author
    if (!targetShout.exists) throw Error('No Shout Found!')
    if (req.user.uid !== targetShout.author.uid) throw Error("You don't have permission to delete shout!")

    ///delete actual post
    const response = await docRef.delete();
    res.status(201).json({
      success: true,
      deletedCount: 1,
      deletedAt: response.writeTime
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error: error.message,
    });
  }
}


//-------------- get all  comments related to specific shoute------------------
async function fetchShoutCommentsHelper(req,res){
  try {
    let currentPage = parseInt(req.query.page) || 1
    const resObj = await commentsPaginationUtil(currentPage,req.params.id)
    res.json(resObj);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error.message,
    });
  }
}
module.exports = { fetchShoutsHanlder, getSpecificShout, deleteSpecificShoutHanlder, createShoutHandler ,fetchShoutCommentsHelper}