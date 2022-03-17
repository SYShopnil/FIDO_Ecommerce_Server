const express = require("express")
const route = express.Router()
const imageUpload = require("../../middileware/imageUpload")
const fileUpload = require("../../middileware/fileUpload")
const {newSellerRegisterController,
    deleteSellerById,
    editSellerInfo,
    deactivateCustomerById,
    seeAllUserController,
    seeIndividualSellerById} = require("../controller/User/seller")

route.post("/create", imageUpload.single("proImg") , newSellerRegisterController)

route.put("/delete/:id", deleteSellerById)
route.put("/update/:id", editSellerInfo)
route.put("/activatedDeActivated/:id", deactivateCustomerById)

route.get("/show/all", seeAllUserController)
route.get("/show/individual/:id", seeIndividualSellerById)

//export part
module.exports = route