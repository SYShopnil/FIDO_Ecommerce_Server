const mongoose = require("mongoose")
const Schema = mongoose.Schema

const customerSchema = new Schema ({
    userId: String,
    password: String,
    userType: {
        type: String,
        default: "customer"
    },
    personalInfo:{
        firstName:{
            type: String,
            trim: true
        },
        lastName: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true
        },
        dateOfBirth: Date,
        sex: {
            enum: ["male", "female"],
            type: String
        },
        contact: {
            permanentAddress: String,
            currentAddress: String,
            contactNumber: String
        },
        profileImage: {
            type: String,
            default: ""
        }
    },
    officialDetails: {
        totalOrder: {
            type: Number,
            default: 0
        },
        orderHistory: [
            {
                orderId: {
                    type: String,
                    default: ""
                },
                orderPlaceDate: {
                    type: Date,
                    default: Date.now
                },
                isActiveOrder: {
                    type: Boolean,
                    default: false
                }
            }
        ]
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
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

module.exports = mongoose.model("Customer", customerSchema)