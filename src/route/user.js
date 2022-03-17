const express = require("express")
const route = express.Router()
const imageUpload = require("../../middileware/imageUpload")
const fileUpload = require("../../middileware/fileUpload")
const {loginController,
    updateOwnProfileInfo,
    seeOwnProfile,
    verifyUsersEmailController} = require("../controller/User/user")
const authentication = require("../../middileware/authentication")
const authorization = require("../../middileware/authorization")

route.post("/login", loginController)
route.post('/email/verify', verifyUsersEmailController)

route.get("/profile", authentication, seeOwnProfile)

route.put("/update/profile", updateOwnProfileInfo)


//export part
module.exports = route

