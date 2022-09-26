const {Router}=require('express');
const { createCommentHanlder, editCommentHanlder, deleteCommentHanlder } = require('../controllers/comment');
const router=Router()
const {ensureAuth}=require('../middlewares/auth')

router.use(ensureAuth);

//---------------- CREATE COMMENT ROUTE--------------
router.route('/')
.post(createCommentHanlder);

//update comment
router.route('/:id')
.put(editCommentHanlder)
//delete comment route
.delete(deleteCommentHanlder);
module.exports=router