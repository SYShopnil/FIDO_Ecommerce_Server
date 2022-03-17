const Joi = require("joi")

//contactValidation
const contactValidation = Joi.object({
    permanentAddress: Joi.string().required(),
    currentAddress: Joi.string().required(),
    contactNumber: Joi.string().required()
})

//personalInfoValidation
const personalInfoValidation = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required().regex(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/),
    dateOfBirth: Joi.date().required(),
    sex: Joi.string().required(),
    contact: contactValidation
})

// profileImageValidation
const profileImageValidation = Joi.object({
    base64: Joi.string().required(),
    size: Joi.number().required()
})
//main validation
const customerValidation = Joi.object({
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    retypePassword : Joi.ref('password'),
    personalInfo: personalInfoValidation, 
    profileImage: profileImageValidation
})


//export part
module.exports = customerValidation
