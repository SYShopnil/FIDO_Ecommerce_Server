const mongoose = require("mongoose")
const Schema = mongoose.Schema

const productSchema = new Schema({
    productDetails: {
        productId: {
            type: String,
            unique : true
        },
        productName: {
            type: String,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        price: {
            previousPrice: {
                type: Number,
                default: 0
            },
            currentPrice: {
                type: Number
            }
        },
        stockInfo:{
            isStock: {
                type: Boolean,
                default: false
            },
            numberOfStock: {
                type: Number,
                default: 0
            }
        },
        othersDetails: {
            freeShipping : {
                type: Boolean,
                default: false
            },
            category: [String],
            tags: [String],
            color: [
                {
                    colorName: String,
                    stockAvailable: Number
                }
            ],
            isDeleted: {
                type: Boolean,
                default: false
            }
        },
        rattingInfo: {
            totalStar: {
                type: Number,
                default: 0,
                max: 5
            },
            totalReview: {
                type: Number,
                default: 0
            },
            reviewSection: [
                {
                    reviewerId: String,
                    review: String,
                    replySection : [
                        {
                            replierId: String,
                            reply: String,
                            mentionerId: String
                        } 
                    ]
                }
            ]
        },
        productImage: String
    },
    companyDetails: {
        brand: String,
        contact: {
            email: {
                type: String,
                trim: true
            },
            address: String
        }
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

productSchema.index ({
    "productDetails.productId": "text",
    "productDetails.productName": "text"
})

module.exports = mongoose.model("Product", productSchema)

