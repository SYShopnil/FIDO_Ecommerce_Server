const categorySchema = {
    categoryName: String,
    productId : [{
        type: ObjectId,
        ref: "Product"
    }]
}

const shopSchema = {
    prdouctCategory : [
        {
            type: ObjectId,
            ref: "Category"
        }
    ],
    product: [
        type: ObjectId,
        ref: "Product"
    ]
}

const productSchema = {
    category : String,
    shopRef: {
        type: ObjectId,
        ref: "Shop"
    }
}

