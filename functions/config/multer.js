const multer = require("multer");
const path = require('path')

//config
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  // if you want size limitaion
  limits: { fileSize: 4 * Math.pow(1024, 2) }, // 4MB
  fileFilter: function (req, file, cb) {
    uploadValidation(file, cb);
  },
  //hanlder for req.rawBody in cloud functions to avoid multipart form parsing error
  startProcessing(req, busboy) {
    if (req.rawBody) {
      // indicates the request was pre-processed
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  },
}).single("shout-img");

// function that handles the  allowed image types
function uploadValidation(file, cb) {
  const allowedTypes = /jpeg|png|jpg/;
  // test the file mimetype and it's extname
  const checkFileType = allowedTypes.test(path.extname(file.originalname));
  const checkMimeType = allowedTypes.test(file.mimetype);
  if (checkFileType && checkMimeType) {
    cb(null, file);
  } else {
    cb(new Error("Invaid File Type, Use only images!"));
  }
}


module.exports=upload
/** *****************************************👉⚠🙄IMPORTANT NOTE ******************************************************
 * Use startProcessing configuration for custom handling of req.rawBody added by cloud functions.
 refer to 
 https://stackoverflow.com/questions/47242340/how-to-perform-an-http-file-upload-using-express-on-cloud-functions-for-firebase
 */
