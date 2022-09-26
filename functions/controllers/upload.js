const sharp = require("sharp");
const os = require("os");
const path = require("path");
const fs = require("fs");
const busboy = require("busboy");
const { admin, db } = require("../config/admin");
const { fileValidator, genFileKey } = require("../utils/utils");
const upload = require('../config/multer')
const { getDownloadURL, ref,getStorage  } = require('firebase/storage')

//get new instance of storage
const storage = getStorage();

//- GOAL IS TO GRAB THE FILE AND COMPRESS IT AND THEN UPLOAD IT TO ADMIN STORAGE BUCKET AND UPDATE USER PROFILE FIELD---

async function profileImgUploadHanlder(req, res) {
  try {
    const userDoc = await db.doc(`/users/${req.user.uid}`).get();
    if (!userDoc.exists) throw Error("No User found!");
    const usersProfileFileKey=userDoc.data().fileKey

    //file credentials helper object
    const uploadImgFile={}
    const bb = busboy({ headers: req.headers });
    bb.on("file", (filedName, file, info) => {
      const { mimeType, encoding, filename } = info;

      // check for allowed file
      if (!fileValidator(mimeType))
        throw Error("File of invalid type! Use only images!");
      //now compress pic

      const transformer = sharp().resize({
        width: 200,
        height: 200,
        fit: "cover",
        position: "top",
        background: "#000",
      });

      
      //give filename unique to avoid replacing same name files
      uploadImgFile.updatedFileName =genFileKey() + path.extname(filename);
      uploadImgFile.path = path.join(
        os.tmpdir(),
        uploadImgFile.updatedFileName
      );
      uploadImgFile.mimeType = mimeType;
      // create a tranformer stream and compress pic from readable stream
      file.pipe(transformer).pipe(fs.createWriteStream(uploadImgFile.path));
    });
    bb.on("finish", async () => {
      const { path, mimeType, updatedFileName } = uploadImgFile;
      if (!path) throw Error("File not found!");

      await fileReplaceHelper(usersProfileFileKey)
      // 👉 now tempDir have uploaded file read file and upload it
      const uploadResponse = await admin
        .storage()
        .bucket()
        .upload(path, {
          destination: "profileImgs/" + updatedFileName,
          resumable: false,
          contentType: mimeType,
        });

      const {mediaLink,name} = uploadResponse[0].metadata;
      if (!mediaLink || !name) throw Error("Uploaded Credentials not found!");
      // update user porfile pic field
      await db.doc(`/users/${userDoc.id}`).update({
        profilePic:mediaLink,
        fileKey:name
      })
      res.json({
        success: true,
        message: "File Uploaded successfully",
        mediaLink,
        name
      });
      //after uploading file delete that file!
      fs.unlinkSync(uploadImgFile.path);
    });
    bb.end(req.rawBody);
  } catch (error) {
    console.log(error);
    res.status(403).json({
      success: false,
      error: error.message,
    });
  }
}

//function for file name handler decide wheter keep it or replace file
async function fileReplaceHelper(fileKey) {
  try {
    
    const defaultFileKey = process.env.FIREBASE_DEFAULT_FILE_KEY;
    if (defaultFileKey == fileKey) return
      //then delete file
      await admin.storage().bucket().file(fileKey).delete()
  } catch (error) {
    throw Error(error)
  }
  
}




//---------------------------- UPLOAD SHOUTS REALATE IMAGES--------------------
async function uploadShoutImageHandler(req,res) {
        upload(req, res, async err => {
            try {
                if (err) throw Error(err)
                // console.log(req.file);
                if (!req.file) throw Error('No  File found!')
                // Reduce file size by 30%
                const mimeType=req.file.mimetype
                const bufferData = await sharp(req.file.buffer)
                .png({
                    quality:70,
                    force:false,
                })
                .toBuffer();
                // grab file buffer and upload 
                const fileName='shoutsImgs/'+genFileKey()+'.'+mimeType.split('/')[1]    
                const fileRef=admin.storage().bucket().file(fileName)    
                await fileRef.save(bufferData,{
                    resumable:false,
                    contentType:mimeType
                })
                //get back downlaod url
                const downlaodRef=ref(storage,fileName)
                const uploadUrl=await  getDownloadURL(downlaodRef)
                res.json({
                    success: true,
                    uploadUrl,
                    fileName
                })
            } catch (error) {
                console.error(error);
                res.status(403).json({
                    success: false,
                    error: error.message
                })
            }
        })
    
}
module.exports = { profileImgUploadHanlder ,uploadShoutImageHandler};
