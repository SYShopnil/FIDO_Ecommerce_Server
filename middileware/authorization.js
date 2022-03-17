const jwt  = require("jsonwebtoken")
require("dotenv").config()

//get the data from dot env file
const jwtSecreteKey = process.env.JWT_TOKEN //get the security code from env file

const authorizedMiddleware = (data) => {
    const authorizedController = (req, res, next) => {
        const roleData = data //store the role data here
        const token = req.header("Authorization") //get the token from header
        const {userType} = jwt.verify(token, jwtSecreteKey) //get the user type from token

        const isFound = roleData.find(data => data == userType) //find the role
        if(isFound){
            next()
        }else{
            res.status(401).json({
                message: "Restricted Route"
            })
        }
        
        

    }
    return authorizedController
}

//export part
module.exports = authorizedMiddleware