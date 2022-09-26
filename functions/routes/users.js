const { Router } = require("express");
const router = Router();

const { ensureAuth } = require("../middlewares/auth");
const { updateUserCrendentialsHandler}=require('../controllers/users');
router.use(ensureAuth)

//----------- update profile info----------------------------------
router.put('/profile',updateUserCrendentialsHandler)


module.exports = router;
