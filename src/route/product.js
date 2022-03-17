const express = require("express")
const route = express.Router()
const imageUpload = require("../../middileware/imageUpload")
const fileUpload = require("../../middileware/fileUpload")
const {createProductController,
    deleteProductController,
    updateProductDetailsController,
    showAllProductController,
    getProductByIdController,
    filterProductController,
    productSearchController} = require("../controller/Product/product")

route.post("/create", createProductController)

route.put("/delete/:id", deleteProductController)
route.put("/update/:id", updateProductDetailsController)

route.get("/get/all", showAllProductController)
route.get("/get/product/:id", getProductByIdController)
route.get("/filter", filterProductController)
route.get("/search", productSearchController)

//export part
module.exports = route