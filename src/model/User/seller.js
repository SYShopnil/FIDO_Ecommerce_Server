const mongoose = require("mongoose")
const Schema = mongoose.Schema

const sellerSchema = new Schema({
    userId: {
        type: String,
        required: true,
        unique : true
    },
    password: {
        type: String,
        required: true,
        unique : true
    },
    userType: {
        type: String,
        default: "seller"
    },
    personalInfo:{
        firstName: String,
        lastName: String,
        email:{
            type: String,
            required: true,
            unique: true
        },
        dateOfBirth: {
            type: Date,
            default: Date.now,
        },
        sex: {
            type: String,
            enum: ["male", "female"]
        },
        profileImage: {
            type: String,
            required: true,
            default: ""
        },
        contact: {
            permanentAddress: String,
            currentAddress: String,
            contactNumber: String,
            country: {
                type: String,
                default: "bangladesh"
            }
        }
    },
    educationalBackground:{
        degree: [
            {
                degreeName: String,
                result: String,
                session: String,
                passingYear: String
            }
        ]
    },
    officialInfo: {
        promotionalHistory:{
            currentPost: {
                type: String,
                default: ""
            },
            history:[
                {
                    previousPost: {
                        type: String,
                        default: ""
                    },
                    currentPost: String,
                    currentSalary: {
                        type: String,
                        default: ""
                    },
                    promotionDate: {
                        type: Date,
                        default: Date.now
                    }
                }
            ]
        },
        salary: {
            type: String,
            default: ""
        },
        isActivated: {
            type: Boolean,
            default: false
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    recoveryToken : {
        type: String,
        default: ""
    },
    modificationInfo:{
        createdAt: {
            type: Date,
            default: Date.now,
        },
        updatedAt:{
            type: Date,
            default: Date.now
        }
    }
})

module.exports = mongoose.model("Seller", sellerSchema)