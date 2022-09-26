const crypto = require("crypto");
const { db } = require("../config/admin");


//function for file validator
function fileValidator(mimeType) {
  const allowedTypes = /png|jpg|jpeg/;
  return allowedTypes.test(mimeType);
}

//function for generating filename
function genFileKey() {
  return crypto.randomBytes(16).toString("hex");
}



/**function for converting firebase doc snapshot to json objects
 * @param {Object} docSnapshot firebase found document snapshot
*/

function dataParser(docSnapshot) {
  return {
    id: docSnapshot.id,
    ...docSnapshot.data()
  }
}

/**function for converting firebase doc snapshot to json objects
 * @param {Object} docSnapshot firebase found document snapshot , Snaphost must have author field to populate author fields!
*/

async function populateAuthorHelper(docSnapshot) {
  try {
    const authorRef = db.collection('users').doc(docSnapshot.data().author)
    let author = await authorRef.get()
    let { profilePic, name } = author.data()
    return {
      ...dataParser(docSnapshot),
       author: {
           id: author.id,
           profilePic, name
       }
   }
  } catch (error) {
    throw Error(error)
  }

}
module.exports = { fileValidator, genFileKey, dataParser ,populateAuthorHelper}