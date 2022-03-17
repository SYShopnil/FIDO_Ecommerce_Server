const jwt  = require("jsonwebtoken")
require("dotenv").config()

//get the dot env file
const jwtSecreteKey = process.env.JWT_TOKEN //get the jwt secrete code from dote env

const authenticationMiddleware = async (req, res, next) => {
    try{
        const token = req.header("Authorization") //get the token from header
        if(token){
            const isValidToken = jwt.verify(token, jwtSecreteKey )
            if(isValidToken){
                const verified = isValidToken
                req.user = verified
                next()
            }else{
                res.json({
                    message : "Unauthorized user"
                })
            }
        }else{
            res.json({
                message: "Unauthorized user"
            })
        }
    }catch(err){
        console.log(err)
        res.json({
            err
        })
    }
}

//export part
module.exports = authenticationMiddleware