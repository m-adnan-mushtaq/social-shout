const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middlewares/auth')
const { profileImgUploadHanlder, uploadShoutImageHandler } = require('../controllers/upload')

//middlwares for hadnling req.raw
router.use(express.raw({
    inflate: false,
    limit: '20mb',
    type: '*/*'
}))
//handle only authentication request
router.use(ensureAuth)

//---------------- upload shouts images file to the firebase bucket---------------------
router.post('/', uploadShoutImageHandler)

//--------- upload and update profile picture----------------------
router.post("/profileImg", profileImgUploadHanlder);
module.exports = router