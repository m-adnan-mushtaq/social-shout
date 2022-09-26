const { db } = require("../config/admin");


//----------- UPDATE USER FIELDS-------------
async function  updateUserCrendentialsHandler(req,res){
  try {
    //update user fields
    const updateCredentials={}

    let {name,bio,website,address}=req.body
    if(name) updateCredentials.name=name.trim()
    if(bio) updateCredentials.bio=bio.toLowerCase()
    if(address) updateCredentials.address=address
    if(website){
        if(!website.startsWith('http')) website='http://'+website
        updateCredentials.website=website
    }

    await db.doc(`/users/${req.user.uid}`).update(updateCredentials)
    res.status(201).json({
        succuess:true,
        message:'User Fields Updated Successfully!'
    })
} catch (error) {
    res.status(403).json({
        succuess:false,
        error:error.message
    })
}
}



module.exports = { updateUserCrendentialsHandler };
