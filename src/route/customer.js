const express = require("express")
const route = express.Router()
const imageUpload = require("../../middileware/imageUpload")
const fileUpload = require("../../middileware/fileUpload")
const {creatCustomerController,
    createCustomerAfterVerifyController,
    deleteCustomer,
    deactivateCustomerById,
    seeAllCustomerController,
    seeIndividualCustomerById} = require("../controller/User/customer")
const authentication = require("../../middileware/authentication")
const authorization = require("../../middileware/authorization")

route.post("/create", imageUpload.single("proImage"), creatCustomerController)
route.post("/verified/create", createCustomerAfterVerifyController)

route.put("/delete/:id", deleteCustomer)
route.put("/deactivated/:id", deactivateCustomerById)

route.get("/show/all", seeAllCustomerController)
route.get("/show/individual/:id", seeIndividualCustomerById)

//export part
module.exports = route