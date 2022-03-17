const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    userType: String,
    email: String,
    id: String
})

//export part
module.exports = mongoose.model("User", userSchema)