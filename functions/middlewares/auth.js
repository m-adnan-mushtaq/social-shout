const {admin, db}=require('../config/admin')

//------------- auth middlewares----------------------------
async function ensureAuth(req, res, next) {
  try {
    // get the token from Authorizatio header
    const tokenHeader = req.headers.authorization
    if (!tokenHeader) throw Error('UnAuthorized Request!')
    const token = tokenHeader.split('Bearer ')[1]
    // verify token
    if(!token) throw Error('UnAuthorized Request!')
    const decodedToken = await admin.auth().verifyIdToken(token)
    if (!decodedToken || !decodedToken.uid) throw Error("Invalid Token!")

    req.user = decodedToken
    next()

  } catch (error) {
    res.status(400).json({
      error: error.message
    })
  }
}

module.exports={ensureAuth}