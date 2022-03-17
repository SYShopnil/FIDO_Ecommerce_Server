const Product = require("../../model/Product/product")
const User = require("../../model/User/user")
const Admin = require("../../model/User/admin")
const Seller = require("../../model/User/seller")
const Customer = require("../../model/User/customer")
const ProductValidation = require("../../../validation/Product/productValidaiton")
const { updateOne } = require("../../model/Product/product")
const {singleImageUploader} = require("../../../utils/singleFileUploader")

// create  product controller
const createProductController = async (req, res) => {
    try{
        const {error} = ProductValidation.validate(req.body) //validate the input part
        if(error){
            console.log(error);
            res.json({
                message: "Joi Validation Error",
                error
            })
        }else{
            // console.log(req.body)
            const {currentPrice} = req.body.productDetails.price //get the price of product
            // const {numberOfStock} = req.body.productDetails.stockInfo //get the stock number of product
            const {brand} = req.body.companyDetails //get the brand name of the product
            const {base64, size} = req.body.productImage //get the product image from body
            const imageFile = {
                base64,
                size
            } //get the image file 
            const acceptedExtension = ["jpeg", "jpg", "ping"] //accepted extension
            const uploadFile = singleImageUploader(imageFile, acceptedExtension)
            const {color} = req.body.productDetails.othersDetails //get the color from body


            const totalStock = color.reduce((initial, update) => (
                initial + +update.stockAvailable
            ), 0) //get the total stock number 
            // console.log(totalStock);
            const {
                fileAddStatus,
                fileUrl,
                extensionValidation
            } = uploadFile //get the response from upload file 
            
            // console.log(req.body);

            if (fileAddStatus) {
                if (extensionValidation) {
                    const file = fileUrl //store the file url 
                    //generate a unique product id
                    function generateUniqueProductId (brand) {
                        const brandLetter = brand.split("") 
                        let randomNumber = (brandLetter[0] + brandLetter[1]).toUpperCase()
                        for(let i = 1 ; i<=8; i++ ){
                            randomNumber += Math.floor(Math.random() * 9 + 1)
                        } //generate the random number
                        return randomNumber
                    }

                    const isStock = totalStock  >= 0 ?  true : false //is it in stock or not

                    //verified is it a unique product id
                    let productId = generateUniqueProductId(brand)
                    const isAvailableId = await Product.findOne({productId}) //find that is this id exist or not
                    if(isAvailableId){ //if this unique id is available in data base
                        productId = generateUniqueProductId(brand)
                    }
                    //store the product data 
                    const storeTheProductData = new Product({
                        ...req.body,
                        "productDetails.productId": productId,
                        "productDetails.price.previousPrice": currentPrice,
                        "productDetails.stockInfo.isStock": isStock,
                        "productDetails.productImage": file,
                        "productDetails.stockInfo.numberOfStock": totalStock
                    }) //store the data into the database

                    //save the data
                    const isSaved = await storeTheProductData.save() //save the data

                    if(isSaved){
                        const data = isSaved //store the data into a new variable
                        res.status(201).json({
                            message: "New Product has been saved successfully",
                            data
                        })
                    }else{
                        res.json({
                            message: "Product creation failed"
                        })
                    }

                }else {
                    res.json({
                        message: "only jpg jpeg and png are allowed"
                    })
                }
            }else{
                res.json({
                    message: "Image upload failed"
                })
            }
            //get the File name
            // let imageFileName = []
            // req.files.map(ele => {
            //     imageFileName.push(ele.filename)
            // })
        }
    }catch(err){
        // console.log(err);
        res.json({
            err
        })
    }
}

//delete a product 
const deleteProductController = async (req, res) => {
    try{
        const {id} = req.params //get the id from params
        const isValidProduct = await Product.findOne(
            {
                _id: id,
                "productDetails.othersDetails.isDeleted": false
            }
        ) //find  the product
        if(isValidProduct){
            const updateProduct = await Product.updateOne(
                {
                    _id: id,
                    "productDetails.othersDetails.isDeleted": false
                }, //querry
                {
                    $set: {
                        "productDetails.othersDetails.isDeleted": true
                    },
                    $currentDate: {
                        "modificationInfo.updatedAt": true
                    }
                }, //update
                {multi: true} //option
            )
            if(updateProduct.nModified != 0){
                res.status(202).json({
                    message: "Product is deleted successfully"
                })
            }else{
                res.json({
                    message: "Product is not deleted"
                })
            }
        }else{
            res.status(404).json({
                message: "Product not found"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}

//update product details
const updateProductDetailsController = async (req, res) => {
    try{
        const {id} = req.params //get the data from params
        const isValidProduct = await Product.findOne(
            {
                _id: id,
                "productDetails.othersDetails.isDeleted": false
            }
        ) //find the product
        
        // console.log(req.body);
        if(isValidProduct) {
            const product = isValidProduct //store the product here
            const {currentPrice: oldCurrentPrice} = product.productDetails.price //get the current price and previous price of the product before update
            const {currentPrice:newCurrentPrice} = req.body.productDetails.price //take the current price from req body
            const updateProductInfo = await Product.updateOne( //find the data and update the data according to the body
                {
                    _id: id,
                    "productDetails.othersDetails.isDeleted": false
                }, //querry
                {
                    $set: req.body
                }, //update partprice
                {multi: true} //option
            ) //update the product details

            if(updateProductInfo.nModified != 0){ //check that if the data has been updated or not

                if(oldCurrentPrice != newCurrentPrice){  //check that if the price is being changed or not
                    const storeProductPrice = await Product.updateOne( //change the product price and update the previous price also
                        {
                            _id: id,
                            "productDetails.othersDetails.isDeleted": false
                        }, //querry
                        {
                            $set: {
                                "productDetails.price.currentPrice": newCurrentPrice, //the price what we change
                                "productDetails.price.previousPrice": oldCurrentPrice, //store my old price as a previous price
                            }
                        }, //update
                        {multi: true} //option
                    )
                    if(storeProductPrice){
                        console.log("Product price has been updated");
                    }else{
                        console.log("Product price has not updated");
                    }
                }else{
                    console.log(`Product price is unchanged`);
                }
                res.status(202).json({
                    message: "Product has been updated successfully"
                })
            }else{
                res.json({
                    message: "Product update failed"
                })
            }
        }else {
            res.json({
                message: "Product not found"
            })
        }
    }catch(err) {
        console.log(err);
        res.json({
            err
        })
    }
}

//show all product controller
const showAllProductController = async (req, res) => {
    try{
        const findProduct = await Product.find(
            {
                "productDetails.othersDetails.isDeleted": false
            }
        ) //search the product
        if(findProduct) {
            const product = findProduct //store the product 
            res.status(202).json({
                message: "Product Found",
                product
            })
        }else {
            res.json({
                message: "Product not found"
            })
        }
    }catch(err) {
        console.log(err);
        res.json({
            message: "Product not found"
        })
    }
}

// get product by id
const getProductByIdController = async (req,res) => {
    try {
        const {id} = req.params //get the id from params
        if(id) {
            const findProduct = await Product.findOne({
                _id: id,
                "productDetails.othersDetails.isDeleted": false
            }) //find the product by id and is deleted or not 

            if(findProduct) {
                const product = findProduct //store the product here
                res.status(202).json({
                    message: "Product Found",
                    product
                })
            }else {
                res.json({
                    message: "Product Not found"
                })
            }
        }else {
            res.json({
                message: "Product Id not found"
            })
        }

    }catch(err) {
        console.log(err);
        res.json({
            message: "Product Not found"
        })
    }
}

//filtering product 
const filterProductController = async (req, res) => {
    try {
        console.log(req.query);
        const {max:maximum, min: minimum, category:productCategory} = req.query

        const max = maximum ? maximum : "" //set the query amount of  maximum price  if user give it then it will show that one otherwise it is "" or false
        const min = minimum ? minimum : "" //set the query amount of  minimum price if user give it then it will show that one otherwise it is "" or false
        const category = productCategory ? productCategory : "" //set the query value of  category if user give it then it will show that one otherwise it is "" or false
        const query = max || min || category  
        ?
        {
            $and: []
        } //if there have any query then it will execute 
        :
        {} //check that is there have any query 

        if (max) {
            query.$and.push({
                "productDetails.price.currentPrice": {
                    $lte: max
                }
            })
        } // if filtered by minimum amount is available or  true then it will just push the data according to the schema design 

        if (min) {
            query.$and.push({
                "productDetails.price.currentPrice": {
                    $gte: min
                }
            })
        } // if filtered by minimum amount is available or  true then it will just push the data according to the schema design

        if (category) {
            query.$and.push({
                "productDetails.othersDetails.category": category
            })
        } // if filtered by category true then it will just push the data according to the schema design


        //We have to build this in dynamic way
        // const findProduct = await Product.find (
        //     {
        //         $and: [
        //             {
        //                 "productDetails.price.currentPrice": {$lte: max},
        //             },
        //             {
        //                 "productDetails.price.currentPrice": {$gte: min},
        //             },
        //             {
        //                 "productDetails.othersDetails.category": category
        //             }
        //         ]
        //     }
        // )
        const findProduct = await Product.find (
            query
        ) //we just need to pass the query 
        res.json({
             amount: findProduct.length,
            data: findProduct
        })

    }catch (err) {
        console.log(err);
        res.json({
            message: err.message, 
            err
        })
    }
}

//search by string 
// const productSearchController = async (req, res) => {
//     try {
//         const searchInput = "umami mumblecore etsy 8-bit pok pok +1 wolf. Vexillologist yr dreamcatcher waistcoat, authentic"
//         const findProduct = await  Product.find ({
//             $text: {
//                 $search: searchInput
//             }
//         })
//         res.json({
//             total: findProduct.length,
//             data: findProduct
//         })
//     } catch (error) {
//         console.log(error)
//         res.json ({
//             message: err.message, 
//             error
//         })
//     }
// }

const productSearchController = async (req, res) => {
    try {
        function stringToRegex(s, m) {
            console.log({s, m});
            return (m = s.match(/^([\/~@;%#'])(.*?)\1([gimsuy]*)$/)) ? new RegExp(m[2], m[3].split('').filter((i, p, s) => s.indexOf(i) === p).join('')) : new RegExp(s);
        }
    //    const {key}=req.body;
   
    const key = "product Name"
        const regx = stringToRegex(`/${key}/`);
       const users= await Product.find({"productDetails.productName":regx})
        res.send({ cnt:users.length,users });
    } catch (error) {
        
        res.send({ error })
    }
}

//export part
module.exports = {
    createProductController,
    deleteProductController,
    updateProductDetailsController,
    showAllProductController,
    getProductByIdController,
    filterProductController,
    productSearchController
}