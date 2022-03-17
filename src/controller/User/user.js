const User = require("../../model/User/user")
const Admin = require("../../model/User/admin")
const Customer = require("../../model/User/customer")
const Seller = require("../../model/User/seller")
const jwt = require('jsonwebtoken')
const e = require("express")
require("dotenv").config()
const bcrypt = require("bcrypt")

//get the data from dot env
const jwtToken = process.env.JWT_TOKEN //get the jwt token from dot env

//login controller
const loginController = async (req, res) => {
    try{
        const {email, password} = req.body //take the input from body
        const inputPassword = password
        //find the user from user Schema
        const isValidUser = await User.findOne({email}) //find the user from User schema
        if(isValidUser){
            const findUser = isValidUser //get the user here
            const {userType, email} = findUser 
            if(userType == "admin"){
                const findUser = await Admin.findOne({
                    "personalInfo.email": email,
                    "officialInfo.isActivated": true
                }) //find the user from data base
                if(findUser){
                    const {_id, userType, userId, password} = findUser
                    const isRightPassword = await bcrypt.compare(inputPassword, password )
                    if(isRightPassword){
                        const data = {
                            id: _id,
                            userType,
                            userId
                        }
                        const getToken = jwt.sign(data, jwtToken, {expiresIn: "10d"} )
                        if(getToken){
                            const token = getToken //store the token here
                            res.status(202).json({
                                message: "Login Successfully",
                                token
                            })
                        }else{
                            res.json({
                                message: "Json Web token error"
                            })
                        }
                    }else{
                        res.json({
                            message: "email or password is incorrect"
                        })
                    }
                }else{
                    res.json({
                        message: "email or password is incorrect"
                    })
                }
            }else if(userType == "seller"){
                console.log(`hello`);
                const findUser = await Seller.findOne({
                    "personalInfo.email": email,
                    "officialInfo.isActivated": true
                }) //find the user from data base
                if(findUser){
                    const {_id, userType, userId, password} = findUser
                    const isRightPassword = await bcrypt.compare(inputPassword, password )
                    if(isRightPassword){
                        const data = {
                            id: _id,
                            userType,
                            userId
                        }
                        const getToken = jwt.sign(data, jwtToken, {expiresIn: "10d"} )
                        if(getToken){
                            const token = getToken //store the token here
                            res.status(202).json({
                                message: "Login Successfully",
                                token
                            })
                        }else{
                            res.json({
                                message: "Json Web token error"
                            })
                        }
                    }else{
                        res.json({
                            message: "email or password is incorrect"
                        })
                    }
                }else{
                    res.json({
                        message: "email or password is incorrect"
                    })
                }
            }else if(userType == "customer"){
                const findUser = await Customer.findOne({
                    "personalInfo.email": email,
                    "isActive": true
                }) //find the user from data base
                if(findUser){
                    const {_id, userType, userId, password} = findUser
                    const isRightPassword = await bcrypt.compare(inputPassword, password )
                    if(isRightPassword){
                        const data = {
                            id: _id,
                            userType,
                            userId
                        }
                        const getToken = jwt.sign(data, jwtToken, {expiresIn: "10d"} )
                        if(getToken){
                            const token = getToken //store the token here
                            res.status(202).json({
                                message: "Login Successfully",
                                token
                            })
                        }else{
                            res.json({
                                message: "Json Web token error"
                            })
                        }
                    }else{
                        res.json({
                            message: "email or password is incorrect"
                        })
                    }
                }else{
                    res.json({
                        message: "email or password is incorrect"
                    })
                }
            }
            
        }else{
            res.json({
                message: "User Not found"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}

//update own profile info
const updateOwnProfileInfo = async (req, res) => {
    const token = req.header("Authorization") //get the token from header
    if(!token){
        res.json({
            message: "Token is not available"
        })
    }else{
        const tokenData = jwt.verify(token, jwtToken)
        const {id, userType } = tokenData //get the data from token 
        const {userId:bodyUserId}= req.body //get the user id from req.body
        if(userType.toLowerCase() == "admin"){ //if the user is admin
            const findAdmin = await Admin.findOne({_id: id, userId:bodyUserId}) //find the admin
            if(findAdmin){
                const updateProfileInfo = await Admin.updateOne(  //update the admin profile data
                    {
                        _id: id
                    }, //query
                    {
                        $set: req.body
                    }, //update
                    {multi: true} //option
                ) //update the data
                if(updateProfileInfo.nModified != 0 ){ //if there have any update happened
                    //update the update time
                    await Admin.updateOne(
                        {
                            _id: id
                        },
                        {
                            $currentDate: {
                                "modificationInfo.updatedAt": true
                            }
                        },
                        {multi: true}
                    )
                    res.status(202).json({
                        message: `${findAdmin.personalInfo.FirstName} ${findAdmin.personalInfo.LastName} is updated successfully`
                    })
                }else{
                    res.status(404).json({
                        message: `${findAdmin.personalInfo.FirstName} ${findAdmin.personalInfo.LastName} is not updated successfully`
                    })
                }
            }else{
                res.status(404).json({
                    message: "Admin not found"
                })
            }
        }else if(userType.toLowerCase() == "customer"){ //if the user is customer
            const findCustomer = await Customer.findOne({_id: id, userId:bodyUserId}) //find the customer
            if(findCustomer){ //if the customer exist then it will execute
                const updateProfileInfo = await Customer.updateOne(  //update the customer data
                    {
                        _id: id
                    }, //query
                    {
                        $set: req.body
                    }, //update
                    {multi: true} //option
                ) //update the data
                if(updateProfileInfo.nModified != 0 ){ //if there have any update happened
                    res.status(202).json({
                        message: `${findCustomer.personalInfo.firstName} ${findCustomer.personalInfo.lastName} is updated successfully`
                    })
                    //update the update time
                    await Customer.updateOne(
                        {
                            _id: id
                        },
                        {
                            $currentDate: {
                                "modificationInfo.updatedAt": true
                            }
                        },
                        {multi: true}
                    )
                }else{
                    res.status(404).json({
                        message: `${findCustomer.personalInfo.firstName} ${findCustomer.personalInfo.lastName} is not updated successfully`
                    })
                }
            }else{
                res.status(404).json({
                    message: "Customer not found"
                })
            }
        }else if(userType.toLowerCase() == "seller"){ //if the user is seller
            const findSeller = await Seller.findOne({_id: id, userId:bodyUserId}) //find the seller
            if(findSeller){ //if the seller exist then it will execute
                const updateProfileInfo = await Seller.updateOne(  //update the seller data
                    {
                        _id: id
                    }, //query
                    {
                        $set: req.body,
                    }, //update
                    {multi: true} //option
                ) //update the data
                if(updateProfileInfo.nModified != 0 ){ //if there have any update happened
                    res.status(202).json({
                        message: `${findSeller.personalInfo.firstName} ${findSeller.personalInfo.lastName} is updated successfully`
                    })
                    //update the update time
                    await Seller.updateOne(
                        {
                            _id: id
                        },
                        {
                            $currentDate: {
                                "modificationInfo.updatedAt": true
                            }
                        },
                        {multi: true}
                    )
                }else{
                    res.status(404).json({
                        message: `${findSeller.personalInfo.firstName} ${findSeller.personalInfo.lastName} is not updated successfully`
                    })
                }
            }else{
                res.status(404).json({
                    message: "Seller not found"
                })
            }
        }
    }
}

//can see his profile
const seeOwnProfile = async (req, res) => {
    try {
        const token = req.header("Authorization") //get the token from header
        // console.log(token);
        if(!token) {
            res.json({
                message: "User Not Found due to token empty"
            })
        }else {
            const tokenData = await jwt.verify(token, jwtToken) //get the data from token 
            const {id, userType, userId} = tokenData //get the data from token 
            if(userType == "admin") {
                const findAdmin = await Admin.findOne({_id: id, userId}) //find the admin
                const {firstName, lastName} = findAdmin.personalInfo //get the name of that admin
                if(findAdmin) { //if the admin is match then execute it
                    const adminData = findAdmin
                    res.status(202).json({
                        message: `${firstName} ${lastName} found`,
                        data: adminData
                    })
                }else {
                    res.json({
                        message: "Admin Not Found"
                    })
                }
            }else if(userType == "customer") {
                const findCustomer = await Customer.findOne({_id: id, userId}) //find the admin
                const {firstName, lastName} = findCustomer.personalInfo //get the name of that admin
                if(findCustomer) { //if the customer is match then execute it
                    const customerData = findCustomer  //store the customer data
                    res.status(202).json({
                        message: `${firstName} ${lastName} found`,
                        data: customerData
                    })
                }else {
                    res.json({
                        message: "Customer Not Found"
                    })
                }
            }else if (userType == "seller") {
                const findSeller = await Seller.findOne({_id: id, userId}) //find the admin
                const {firstName, lastName} = findSeller.personalInfo //get the name of that admin
                if(findSeller) { //if the seller is match then execute it
                    const sellerData = findSeller  //store the customer data
                    res.status(202).json({
                        message: `${firstName} ${lastName} found`,
                        data: sellerData
                    })
                }else {
                    res.json({
                        message: "Seller Not Found"
                    })
                }
            }
        }
    }catch(err) {
        res.json({
            err,
            message: "Profile not found"
        })
    }
}

//create the user after verification
const verifyUsersEmailController = async (req, res) => {
    try{
        // const headerToken = req.header("Authorization") //get the token from header
        const {token , code} = req.body //get the token and code from body
        console.log({token, code});
        const isValidToken = jwt.verify(token, jwtToken) //check that is it a valid token or not
        if(isValidToken){
            const tokenData = isValidToken //store the token data here
            const {id,userType} = tokenData //get the id  and userType from token

            if(userType == "admin") {
                const findAdmin = await Admin.findOne(
                    {
                        "_id": id ,
                        "officialInfo.isActivated": false,
                        "recoveryToken": code
                    }
                ) //find the admin by is active and object id

                if(findAdmin) { //if the admin is found it will executed
                    const activeAdmin = await Admin.updateOne(
                        {
                            "_id": id ,
                            "officialInfo.isActivated": false,
                            "recoveryToken": code
                        }, //querry
                        {
                            $set: {
                                "recoveryToken": "",
                                "officialInfo.isActivated": true
                            }
                        }, //update
                        {multi: true} //option
                    )
                    if(activeAdmin.nModified != 0) { //this mean it is Modified
                        const data = await Admin.findOne({_id: id}) //find the admin
                        //main successful response
                        res.status(201).json({
                            message: "Registration Successfully done",
                            userData: data
                        })
                    }else {
                        res.json({
                            message: "User Activation failed"
                        })
                    }
                }else {
                    res.json({
                        message: "User Not Found"
                    })
                }
            }else if (userType == "seller") {
                const findSeller = await Seller.findOne(
                    {
                        "_id": id ,
                        "officialInfo.isActivated": false,
                        "recoveryToken": code
                    }
                ) //find the admin by is active and object id

                if(findSeller) { //if the admin is found it will executed
                    const activeSeller = await Seller.updateOne(
                        {
                            "_id": id ,
                            "officialInfo.isActivated": false,
                            "recoveryToken": code
                        }, //querry
                        {
                            $set: {
                                "recoveryToken": "",
                                "officialInfo.isActivated": true
                            }
                        }, //update
                        {multi: true} //option
                    )
                    if(activeSeller.nModified != 0) { //this mean it is Modified
                        const data = await Seller.findOne({_id: id})
                        //main successful response
                        res.status(201).json({
                            message: "Registration Successfully done",
                            userData: data
                        })
                    }else {
                        res.json({
                            message: "User Activation failed"
                        })
                    }
                }else {
                    res.json({
                        message: "User Not Found"
                    })
                }
            }
            //final
            const findTheUser = await Customer.findOne({ //find the user according to the header token
                $and: [
                    {
                        _id: id
                    },
                    {
                        "recoveryToken": code
                    }
                ]
            })
            if(findTheUser){ //if the user have found according to the header then it will execute
                const activeUser = await Customer.updateOne( //active the user to display
                    {
                        $and:[
                            {
                                _id: id
                            },
                            {
                                "recoveryToken": code
                            }
                        ]
                    }, //querry
                    {
                        $set: {
                            "recoveryToken": "",
                            "isActive": true
                        }
                    }, //update
                    {multi: true} //option
                )
                if(activeUser){ //if the user is created successfully then it will execute
                    const user = await Customer.find({_id: id}) //find the user by user unique id
                    res.status(201).json({
                        message: "Customer has been created successfully",
                        user
                    })
                }else{
                    res.json({
                        message: "Customer Creation failed cause active is not updated"
                    })
                }
            }else{
                res.json({
                    message: "User not found"
                })
            }
            //final end
        }else{
            res.json({
                message: "Token is invalid or expired"
            })
        }
    }catch(err){
        // console.log(err);
        res.json({
            message: "user creation failed",
            err
        })
    }
}

//export part
module.exports = {
    loginController,
    updateOwnProfileInfo,
    seeOwnProfile,
    verifyUsersEmailController
}