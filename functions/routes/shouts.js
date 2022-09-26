const { Router } = require("express");
const router = Router();


const { ensureAuth } = require("../middlewares/auth");

router.use(ensureAuth);
const { fetchShoutsHanlder, createShoutHandler, getSpecificShout, deleteSpecificShoutHanlder ,fetchShoutCommentsHelper}=require('../controllers/shouts')
//----------- @all shouts/------------------
router
  .route("/")
  .get(fetchShoutsHanlder)
  .post(createShoutHandler);


//get all comments related specific shout
router.get('/:id/comments',fetchShoutCommentsHelper)

//---------- @specifc shouts/:id--------------  
router
  .route("/:id")
  .get(getSpecificShout)
  .delete(deleteSpecificShoutHanlder);

module.exports = router;
