const Joi = require("joi")

//contactValidation
const contactValidation = Joi.object({
    permanentAddress: Joi.string().required(),
    currentAddress: Joi.string().required(),
    contactNumber: Joi.string().required(),
    country: Joi.string()
})
//personalInfoValidation
const personalInfoValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    sex: Joi.string().required(),
    contact: contactValidation
})

//degreeValidation
const degreeValidation = Joi.array().items({
    degreeName: Joi.string().required(),
    result: Joi.string().required(),
    session: Joi.string().required(),
    passingYear: Joi.string().required()
    // institution: Joi.string().required()
})

//educationalBackgroundValidation
const educationalBackgroundValidation = Joi.object({
    degree: degreeValidation
})

//promotionalHistoryValidation
const promotionalHistoryValidation = Joi.object({
    currentPost: Joi.string()
})

//officialInfoValidation
const officialInfoValidation = Joi.object({
    promotionalHistory: promotionalHistoryValidation,
    salary: Joi.string().required()
})

// profileImageValidation
const profileImageValidation = Joi.object({
    base64: Joi.string(),
    size: Joi.number()
})

//main validation part
const sellerMainValidation = Joi.object({
    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    retypePassword: Joi.ref("password"),
    personalInfo: personalInfoValidation,
    educationalBackground: educationalBackgroundValidation,
    officialInfo: officialInfoValidation,
    profileImage: profileImageValidation,
})


//export part
module.exports = sellerMainValidation