const express = require("express")
const route = express.Router()
const imageUpload = require("../../middileware/imageUpload")
const fileUpload = require("../../middileware/fileUpload")
const {createAdminController} = require("../controller/User/admin")

route.post("/create", createAdminController)



//export part
module.exports = route

