const express = require("express")
const app = express()
const mongoose = require("mongoose")

const uploadController = async (req, res) => {
    try{
        console.log(req.file);
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}

module.exports = uploadController
