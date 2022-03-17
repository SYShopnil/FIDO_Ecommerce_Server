const Customer = require("../../model/User/customer")
const User = require("../../model/User/user")
const bcrypt = require("bcrypt")
const customerValidation = require("../../../validation/User/customerValidation")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const nodemailer = require("nodemailer")
const { messages } = require("../../../validation/User/customerValidation")
const { singleImageUploader } = require("../../../utils/singleFileUploader")

//get data from dot env file 
const jwtSecreteKey = process.env.JWT_TOKEN //get the jwt secrete key
const userMail = process.env.USER //get the email
const userPassword = process.env.PASSWORD //get the password

//create a customer
const creatCustomerController = async (req, res) => {
    try{
        const {error} = customerValidation.validate(req.body) //validation the data from req body
        if(error){
            res.json({
                message: "422 validation error",
                error
            })
        }else{
            //get the data from body
            const {dateOfBirth, email} =  req.body.personalInfo
            const {password} = req.body

            //generate the new user id here
            let userId = ""
            for(let i = 1 ; i<=3; i++ ){
                userId = Math.floor(Math.random() * 9 + 1) + userId
            } //generate the random number
            let oneTimeCode = ""
                for(let i = 1 ; i<=4 ; i++ ){
                    oneTimeCode = Math.floor(Math.random() * 9 + 1) + oneTimeCode
                } //generate the onetime Code number
            console.log({oneTimeCode});
            const birthYear = dateOfBirth.split('-')[0]
            const birthDateArray = dateOfBirth.split('-')
            const birthDate = birthDateArray[birthDateArray.length - 1]
            const newUserId = birthYear + userId + birthDate //get the new user id

            //work with profile picture
            const {base64, size} = req.body.profileImage //get the pofile image data from user 
            const file = {
                base64,
                size
            } //image file setup

            const isExistEmail = await User.findOne({email}) //query that is there have any user with this email or not
            if(isExistEmail){
               res.json({
                   message: "Email is exist try with another email"
               }) 
            }else{
                // console.log(req.body);
                // res.status(202).send(req.body) //debug purpose
                const hashedPassword = await bcrypt.hash(password, 10) //hashed the password
                if(hashedPassword){ //check hashed password
                    const acceptedExtenstion = ["jpg", 'jpeg', 'png'] //set the accepted file extension
                    const imageFile = singleImageUploader(file, acceptedExtenstion)
                    const {
                        fileAddStatus,
                        extensionValidation,
                        fileUrl
                    } = imageFile //get the response from single file Uploader
                    if(fileAddStatus) { 
                        if(extensionValidation){
                            const imageLink = fileUrl //get the file url 
                            const createNewCustomer = new Customer({
                                ...req.body,
                                userId: newUserId,
                                password: hashedPassword,
                                "personalInfo.profileImage": imageLink
                            }) //store the data
                            const saveCustomer = await createNewCustomer.save() //save the new customer
                            if(saveCustomer){ //check is the data have been save or not
                                const id = saveCustomer._id
                                const {email} = saveCustomer.personalInfo //get the email of that user
                                const data = {
                                    id,
                                    email
                                }
                                const token = jwt.sign(data, jwtSecreteKey, {expiresIn: "5d"}) //get the token with 5 days validation 
                                const userType = saveCustomer //get the email of that user
                                const updateTheRecoveryToken = await Customer.updateOne( //if the user has been save then store the recovery token in to the schema
                                    {
                                        _id: id
                                    }, //querry
                                    {
                                        $set: {
                                            "recoveryToken": oneTimeCode //store the token here
                                        }
                                    }, //update part
                                    {multi: true} //option
                                )

                                if(updateTheRecoveryToken){
                                    const myDataToken = token //store the token here
                                    const tranporter = nodemailer.createTransport({
                                        service: "gmail",
                                        auth: {
                                            user: userMail,
                                            pass: userPassword
                                        }
                                    })
                                    const mailOption = {
                                        from: userMail,
                                        to: email,
                                        subject: "Verify the email",
                                        text: oneTimeCode
                                    } 
                                    // console.log(`hello`);
                                    await tranporter.sendMail(mailOption, (err, data) => {
                                        if(err){
                                            res.json({
                                                message: "Email send failed"
                                            })
                                        }else{
                                            res.status(201).json({
                                                message: `A verification code has been sent to ${email} please verify this email`,
                                                token: myDataToken
                                            })

                                            //store the data into user schema
                                            const createNewUser = new User({
                                                email,
                                                userType: "customer"
                                            }) //store the data
                                            const saveNewUser = createNewUser.save() //save the new user
                                            if(saveNewUser){
                                                console.log("New user created as a customer");
                                            }else{
                                                console.log("New User creation failed");
                                            }
                                        }
                                    })
                                }else{
                                    res.json({
                                        message: "Recovery Token update failed"
                                    })
                                }
                                //update the User schema
                                const createNewUser = new User ({
                                    email,
                                    userType: "customer"
                                })
                                const saveNewUser = await createNewUser.save()
                                if(saveNewUser){
                                    console.log("New User Created Successfully");
                                }else{
                                    console.log("New User Creation failed");
                                }
                            }else{
                                res.json({
                                    message: "Customer creation failed"
                                })
                            }
                            
                        }else {
                            res.json({
                                message: "Only jpg jpeg and png are allowed"
                            })
                        }
                    }else {
                        res.json({
                            message: "Image file upload failed please try again"
                        })
                    }
                }else{
                    res.json({
                        message: "Password hashing problem"
                    })
                }
            }

        }
    }catch(err){
        console.log(err);
        res.json({
            message: "Registration failed please try again",
            err
        })
    }
}

//create the customer after verification
const createCustomerAfterVerifyController = async (req, res) => {
    try{
        // const headerToken = req.header("Authorization") //get the token from header
        const {token , code} = req.body
        const isValidToken = jwt.verify(token, jwtSecreteKey) //check that is it a valid token or not
        if(isValidToken){
            const tokenData = isValidToken //store the token data here
            const {id} = tokenData //get the id from token
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
                        messages: "Customer has been created successfully",
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
        }else{
            res.json({
                messages: "Token is invalid or expired"
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

//delete a customer by id
const deleteCustomer = async (req, res) => {
    try{
        const {id} = req.params //get the id from params
        const isValidCustomer = await Customer.findOne({_id: id,"isActive": true,
                    "isDeleted": false})
        if(isValidCustomer){
            const customer = isValidCustomer //store the customer data 
            const deleteCustomer = await Customer.updateOne(
                {
                    _id: id
                }, //querry
                {
                    $set: {
                        "isDeleted": true
                    }
                }, //update
                {multi: true} //option
            )
            if(deleteCustomer.nModified != 0 ){
                res.json({
                    message: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName} has deleted`
                })
            }else{
                res.json({
                    message: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName} has not deleted`
                })
            }
        }else{
            res.json({
                message: "Customer not found"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}

//deactivate  a customer by id
const deactivateCustomerById = async (req, res) => {
    try{
        const {id} = req.params //get the id from params
        const isValidCustomer = await Customer.findOne({_id: id, "isDeleted": false}) //find the user
            if(isValidCustomer){
                const {isActive} =  isValidCustomer //get the isActive status of this user
                const customer = isValidCustomer //store the customer data into another variable
                if(isActive){
                    const deActiveCustomer = await Customer.updateOne(
                        {
                            _id: id
                        }, //querry
                        {
                            "isActive": false
                        }, //update
                        {multi: true} //option
                    )
                    if(deActiveCustomer.nModified != 0){
                        res.status(202).json({
                            message: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName} deactivated successfully`
                        })
                    }else{
                        res.status(304).json({
                            message: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName} deactivation failed`
                        })
                    }
                }else{ 
                    const activeCustomer = await Customer.updateOne(
                        {
                            _id: id
                        }, //querry
                        {
                            "isActive": true
                        }, //update
                        {multi: true} //option
                    )
                    if(activeCustomer.nModified != 0){
                        res.status(202).json({
                            message: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName} activated successfully`
                        })
                    }else{
                        res.status(304).json({
                            message: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName} activation failed`
                        })
                    }
                }
            }else{
                res.status(404).json({
                    message: "Customer not found"
                })
            }
    }catch(ee){
        console.log(err);
        res.json({
            err
        })
    }
}

//see all customer
const seeAllCustomerController = async (req, res) => {
    try{
        const findCustomerAll = await Customer.find({}).sort({"modificationInfo.createdAt": 1})
        if(findCustomerAll){
            const customerData = findCustomerAll //store the seller data into another variable
            console.log(customerData);
            res.status(302).json({
                message:  `Data found`,
                customerData
            })
        }else{
            res.status(404).json({
                message: "Customer Not found"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}


//see individual customer by id
const seeIndividualCustomerById = async (req, res) => {
    try{
        const {id} = req.params //get the id from params 
        const isValidCustomer = await Customer.findOne( //is it a valid customer
            {
                _id: id
            }
        ) //find the customer
        if(isValidCustomer) { //if the customer is valid then it will execute
            const seeCustomerData = await Customer.findOne({_id: id})
            if(seeCustomerData){
                const customer = seeCustomerData //store the customer data into a variable
                res.status(302).json({
                    messages: `${customer.personalInfo.firstName} ${customer.personalInfo.lastName} found`,
                    seeCustomerData
                })
            }else{
                res.status(404).json({
                    message: "Customer Not found"
                })
            }
        }else{
            res.status(404).json({
                message: "Customer not found"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}

//export part
module.exports = {
    creatCustomerController,
    createCustomerAfterVerifyController,
    deleteCustomer,
    deactivateCustomerById,
    seeAllCustomerController,
    seeIndividualCustomerById
}