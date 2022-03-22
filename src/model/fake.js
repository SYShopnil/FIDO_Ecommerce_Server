const mongoose  = require ("mongoose");
const Schema = mongoose.Schema;

const Fake = new Schema ({
    firstName: String,
    lastName : String
})

module.exports = mongoose.model ("Hello", Fake)
