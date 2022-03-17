const mongoose = require("mongoose")

const Schema = mongoose.Schema

const adminSchema = new Schema({
    userId: {
        type: String,
        unique: true,
        trim: true
    },
    userType:{
        type: String,
        default: "admin"
    },
    password: {
        type: String
    },
    personalInfo:{
        firstName: {
            trim: true,
            required: true,
            type: String
        },
        lastName: {
            trim: true,
            required: true,
            type: String
        },
        email: {
            type: String,
            unique: true,
            trim: true
        },
        dateOfBirth: {
            type: Date,
            default: Date.now
        },
        contact:{
            permanentAddress: String,
            currentAddress: String,
            contactNumber: String,
            country: {
                type: String,
                default: "bangladesh"
            }
        },
        sex: {
            type: String,
            enum: ["male", "female"]
        },
        profileImage: {
            type: String,
            default: ""
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
    officialInfo:{
        currentPost: {
            type: String,
            default: "admin"
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        isActivated: {
            type: Boolean,
            default: false
        },
        salary:{
            type: String,
            default: ""
        }
    },
    recoveryToken: {
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

module.exports = mongoose.model("Admin", adminSchema)