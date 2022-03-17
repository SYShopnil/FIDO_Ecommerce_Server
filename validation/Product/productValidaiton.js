const Joi = require("joi")

//colorValidation
const colorValidation = Joi.object({
    colorName: Joi.string(),
    stockAvailable: Joi.number()
})

//othersDetailsValidation
const othersDetailsValidation = Joi.object({
    freeShipping: Joi.boolean(),
    category: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    color: Joi.array().items(colorValidation)
})

//stockInfoValidation
// const stockInfoValidation = Joi.object({
//     numberOfStock: Joi.number().required()
// })

//priceValidation
const priceValidation = Joi.object({
    previousPrice: Joi.number(),
    currentPrice: Joi.number().required()
})

//productDetailsValidation
const productDetailsValidation = Joi.object({
    productName: Joi.string().required(),
    description: Joi.string().required(),
    price: priceValidation ,
    othersDetails: othersDetailsValidation
})

//contactValidation
const contactValidation = Joi.object({
    email: Joi.string().required(),
    address: Joi.string().required()
})

//companyDetailsValidation
const companyDetailsValidation = Joi.object({
    brand: Joi.string().required(),
    contact: contactValidation
})

//productImageValidation
const productImageValidation = Joi.object({
    base64: Joi.string(),
    size: Joi.number()
})

//main validation
const mainValidation = Joi.object({
    productDetails: productDetailsValidation,
    companyDetails: companyDetailsValidation,
    productImage: productImageValidation
})

//export part
module.exports = mainValidation