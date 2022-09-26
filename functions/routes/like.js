const {Router}=require('express');
const { likeDislikeHandler } = require('../controllers/like');
const router=Router()
const {ensureAuth}=require('../middlewares/auth')

router.use(ensureAuth);

//---------------- LIKE AND UNLIKE ROUTE--------------
router.post('/',likeDislikeHandler)
module.exports=router