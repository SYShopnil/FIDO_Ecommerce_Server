const multer = require('multer')

//file filter part
const fileFilter = (req, file, cb) => {
    const splitImageMimeType = file.mimetype.split('/')
    const extension = splitImageMimeType[splitImageMimeType.length - 1].toLowerCase()
    if(extension == "jpeg" || extension == "jpg" || extension == "png" ){
        cb(null, true)
    }else{
        cb(new Error("only jpeg, jpg and png are allowed"))
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
        fileSize: 5242880 //max 5 mb is allowed
    },
    fileFilter
})

//export part
module.exports = upload