//required part
const express = require("express");
const app = express()
require('dotenv').config();
const mongoose = require("mongoose");
const adminRoute = require("./src/route/admin");
const bodyParser = require('body-parser')
const cors = require('cors')
const userRoute = require("./src/route/user")
const sellerRoute = require("./src/route/seller")
const customerRoute = require("./src/route/customer")
const productRoute = require("./src/route/product")


//dot env part
const port = process.env.PORT || 8080 //get the port from .env file
const urlOfMongo = process.env.URL //get the mongo url from .env file

//pase the body
app.use(express.json({limit: "250mb"}));
app.use(express.urlencoded({ extended: true, limit: '250mb'}));
app.use(express.static('public'))
app.use(cors())

//create the server 
app.listen(port, () => {console.log(`Server is running on ${port}`)})

//connected to the database
mongoose.connect(urlOfMongo, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true
}, { autoIndex: false })
.then(() => {console.log(`Server is conntected to the data base`);})
.catch(err => {console.log(err);})

//root route
app.get("/", (req, res) => {
    res.send("Hello I am from root")
})

//other's route
app.use("/admin", adminRoute)
app.use("/user", userRoute)
app.use("/seller", sellerRoute)
app.use("/customer", customerRoute)
app.use("/product", productRoute)

//default route
app.get("*", (req, res) => {
    res.status(404).send("404 page not found")
});

// const arr = [
//     {
//         colorName: "Red",
//         stock: 25
//     },
//     {
//         colorName: "Red",
//         stock: 100
//     }
// ]

// const res = arr.reduce((initial, update)=> {
//     return (
//         initial + update.stock
//     )
// }, 0)

// console.log(res);