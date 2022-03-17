const multer = require("multer")

//file filter part
const fileFilter = (req, file, cb) => {
    const splitImageMimeType = file.mimetype.split('/')
    const extension = splitImageMimeType[splitImageMimeType.length - 1].toLowerCase()
    console.log(extension);
    if(extension == "doc" || extension == "docx" || extension == "pdf" ){
        cb(null, true)
    }else{
        cb(new Error("only doc, docx and pdf are allowed"))
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./document/img")
    },
    filename: function (req, file, cb){
        cb(null, Date.now() + "_" + file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1572864 //max 1.5 mb is allowed
    },
    fileFilter
})

//export part
module.exports = upload