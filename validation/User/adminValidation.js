const Joi = require("joi")

//contactValidation
const contactValidation = Joi.object({
    permanentAddress: Joi.string().required(),
    currentAddress: Joi.string().required(),
    contactNumber: Joi.number().required()
})

// profileImageValidation
const profileImageValidation = Joi.object({
    base64: Joi.string(),
    size: Joi.number()
})

//personalInfoValidation
const  personalInfoValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required().regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    dateOfBirth: Joi.date().required(),
    contact: contactValidation,
    sex: Joi.string().required()
})

//degreeValidation
const degreeValidation = Joi.array().items({
    degreeName: Joi.string().required(),
    result: Joi.string().required(),
    session: Joi.string().required(),
    passingYear: Joi.string().required()
})

//educationalBackgroundValidation
const educationalBackgroundValidation = Joi.object({
    degree: degreeValidation
})

//officialInfoValidation 
const officialInfoValidation = Joi.object({
    currentPost: Joi.string(),
    isDeleted: Joi.boolean(),
    isActivated: Joi.boolean(),
    salary: Joi.string().required()
})

//modificationInfoValidation
const  modificationInfoValidation = Joi.object({
    createdAt: Joi.date(),
    updatedAt: Joi.date()
})

//main validation
const mainValidation = Joi.object({
    userId: Joi.string(),
    userType: Joi.string(),
    personalInfo: personalInfoValidation,
    educationalBackground: educationalBackgroundValidation,
    officialInfo: officialInfoValidation,
    recoveryToken: Joi.string(),
    modificationInfo: modificationInfoValidation,
    password: Joi.string().required().pattern(new RegExp('^[a-zA-Z0-9]{6,30}$')),
    retypePassword: Joi.ref("password"),
    profileImage: profileImageValidation,
})

//export part
module.exports = mainValidation