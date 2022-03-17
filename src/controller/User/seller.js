const Seller = require("../../model/User/seller")
const User = require("../../model/User/user")
const bcrypt = require("bcrypt")
const sellerValidation = require("../../../validation/User/sellerValidation")
const { messages } = require("../../../validation/User/sellerValidation")
const jwt = require('jsonwebtoken')
const nodemailer = require("nodemailer")
const {singleImageUploader} = require("../../../utils/singleFileUploader")


//dot env fil 
const jwtSecreteKey = process.env.JWT_TOKEN //get the jwt token from dot env
const mailUserName = process.env.USER //get hte user name of the mail
const mailPassword = process.env.PASSWORD //get the password from env file

//register a new seller
const newSellerRegisterController = async (req, res) => {
    try{
        const {error} = sellerValidation.validate(req.body)
        if(error){
            res.json({
                message: "Joi Validation error",
                error
            })
        }else{
            //get the data from req body
            const {dateOfBirth, email} = req.body.personalInfo
            const {salary} = req.body.officialInfo
            const {currentPost} = req.body.officialInfo.promotionalHistory
            const {password} = req.body
            const {profileImage} = req.body 
            const {base64, size} = profileImage //get the data of profile image

            //image upload part 
            const imageData = {
                base64,
                size
            } //this data we need to sent 

            const acceptedExtension = ["jpeg", "jpg", 'png']
            const isImageUpload = singleImageUploader(imageData, acceptedExtension)
            const {fileAddStatus , extensionValidation, fileUrl} = isImageUpload //get the response from uploader function
            
            //generate the new user id here
            let userId = ""
            for(let i = 1 ; i<=3; i++ ){
                userId = Math.floor(Math.random() * 9 + 1) + userId
            } //generate the random number

            //one time code generator
            let oneTimeCode = ""
            for(let i = 1 ; i<=4 ; i++ ){
                oneTimeCode = Math.floor(Math.random() * 9 + 1) + oneTimeCode
            } //generate the onetime Code number

            const birthYear = dateOfBirth.split('-')[0]
            const birthDateArray = dateOfBirth.split('-')
            const birthDate = birthDateArray[birthDateArray.length - 1]
            const newUserId = birthYear + userId + birthDate //get the new user id

            //hashed the password
            const hashedPassword = await bcrypt.hash(password, 10)
            if(extensionValidation) {
                if(fileAddStatus) {
                    const imageUrl = fileUrl //store the image url here
                    const storeData = new Seller({
                ...req.body,
                userId: newUserId,
                password: hashedPassword,
                "personalInfo.profileImage": imageUrl,
                "officialInfo.promotionalHistory.history.0.currentPost": currentPost,
                "officialInfo.promotionalHistory.history.0.currentSalary": salary
            })

            const isSaved = await storeData.save()

            if(isSaved){
                const saveData = isSaved //store the data into a variable

                const id = saveData._id //get the id from saveUserData
                const {email} = saveData.personalInfo //get the email of the saved data
                const {userType} = saveData //get the userType 

                //update the one time code into schema
                const updateToken = await Seller.updateOne(
                    {
                         $and: [
                            {
                                "_id": id
                            },
                            {
                                "personalInfo.email": email
                            }
                        ]
                    },
                    {
                        $set: {
                                "recoveryToken": oneTimeCode //update the one time code 
                        }
                    },
                    {multi: true}
                )
                if(updateToken) {
                    const tokenData = {
                        id,
                        email,
                        userType
                    } //this data we will get from token

                const createToken = await jwt.sign(tokenData, jwtSecreteKey) //create the token
                if(createToken) {
                    //sent the mail to verify the user
                    const myUserType = userType //store the current user type
                    const code = oneTimeCode //store the one time code
                    const sendMail = email //store the send mail 
                    const token = createToken //this token we need to sent 
                    const transport = nodemailer.createTransport({
                        service: "gmail",
                        auth: {
                                user: mailUserName,
                                pass: mailPassword
                        }
                    }) //create the transporter

                    const mailOption = {
                        from : mailUserName,
                        to: sendMail,
                        subject: "Verify email",
                        text: `Your one time code is: ${code}` //this is the code
                    } //create the mail option

                    await transport.sendMail(mailOption, async (err) => {
                        if(err) {
                            res.json({
                                message: "Email sent failed"
                            })
                            console.log(`email sent failed`);
                        }else {
                        //final send the response
                            res.status(201).json({
                                message: `A verification code has been sent to ${sendMail} please verify this email`,
                                token
                            })
                            console.log(`A verification code has been sent to ${sendMail} please verify this email`);
                                            
                            //create a new user in User model
                            const createUser = new User({
                                userType: myUserType  ,
                                "email" : email
                            })
                            const saveUserData = await createUser.save() //save the new user data
                                if(saveUserData){
                                    console.log("User has been created of Seller type");
                                }else{
                                    console.log("User of Admin type creation has been failed");
                                }
                                //if all is ok then it will finish from here
                        }
                    })
                }else {
                    res.json({
                        message: "token create failed"
                    })
                }
                }else {
                    res.json({
                        message: "one time code update failed"
                    })
                }
            }else{
                res.json({
                    message: "User not save"
                })
            }
                }else {
                    res.json({
                        message: "File upload failed"
                    })
                }
            }else {
                res.json({
                    message: "Only jpg jpeg and png are allowed"
                })
            }
        }
    }catch(err){
        console.log(err);
        res.json({
            err,
            message: "Some thing is goning wrong"
        })
    }
}

//delete a seller by id
const deleteSellerById = async (req, res) => {
    try{
        const {id} = req.params //get the id from params
        const isDeleted = await Seller.updateOne( //find the user and delete it
            {
                _id: id
            }, //querry
            {
                $set: {
                    "officialInfo.isDeleted": true
                }
            }, //update 
            {}
        )
        if(isDeleted.nModified != 0){
            res.json({
                message: `Seller is deleted`
            })
        }else{
            res.status(404).json({
                message: "User not found"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}

//update User info
const editSellerInfo = async (req, res) => {
    try{
        const {id} = req.params //get the data from params
        const isValidUser = await Seller.findOne({
            _id: id,
            "officialInfo.isDeleted": false,
            "officialInfo.isActivated": true
        }) //find seller
        if(isValidUser){
            const user = isValidUser
            const updateData = await Seller.findByIdAndUpdate( //update the seller
                {
                    _id: id
                }, //querry
                {
                    $set: req.body,
                    $currentDate: {
                        "modificationInfo.updatedAt": true
                    }
                }, //update
                {multi: true} //option
            )
            if(updateData) {
                res.json({
                    message: `${user.personalInfo.firstName} ${user.personalInfo.lastName} is updated`
                })
            }else{
                res.json({
                    message: `${user.personalInfo.firstName} ${user.personalInfo.lastName} is not updated`
                })
            }
        }else{
            res.json({
                message: "User not found"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}

//deactivate  a seller by id
const deactivateCustomerById = async (req, res) => {
    try{
        const {id} = req.params //get the id from params
        const isValidCustomer = await Seller.findOne({_id: id, "officialInfo.isDeleted": false}) //find the user
            if(isValidCustomer){
                const {isActivated} =  isValidCustomer.officialInfo //get the isActive status of this user
                const seller = isValidCustomer //store the customer data into another variable
                if(isActivated){
                    const deActiveCustomer = await Seller.updateOne(
                        {
                            _id: id
                        }, //querry
                        {
                            "officialInfo.isActivated": false
                        }, //update
                        {multi: true} //option
                    )
                    if(deActiveCustomer.nModified != 0){
                        res.status(202).json({
                            message: `${seller.personalInfo.firstName} ${seller.personalInfo.lastName} deactivated successfully`
                        })
                    }else{
                        res.status(304).json({
                            message: `${seller.personalInfo.firstName} ${seller.personalInfo.lastName} deactivation failed`
                        })
                    }
                }else{ 
                    const activeCustomer = await Seller.updateOne(
                        {
                            _id: id
                        }, //querry
                        {
                            "officialInfo.isActivated": true
                        }, //update
                        {multi: true} //option
                    )
                    if(activeCustomer.nModified != 0){
                        res.status(202).json({
                            message: `${seller.personalInfo.firstName} ${seller.personalInfo.lastName} activated successfully`
                        })
                    }else{
                        res.status(304).json({
                            message: `${seller.personalInfo.firstName} ${seller.personalInfo.lastName} activation failed`
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

//see all seller
const seeAllUserController = async (req, res) => {
    try{
        const findAllSeller = await Seller.find({}).sort({"modificationInfo.createdAt": 1})
        if(findAllSeller){
            const sellerData = findAllSeller //store the seller data into another variable
            res.status(302).json({
                message: "Data found",
                sellerData
            })
        }else{
            res.status(404).json({
                message: "Seller Not found"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}

//see individual seller by id
const seeIndividualSellerById = async (req, res) => {
    try{
        const {id} = req.params //get the id from params 
        const isValidSeller = await Seller.findOne( //is it a valid seller
            {
                _id: id
            }
        ) //find the seller
        if(isValidSeller) { //if the seller is valid then it will execute
            const seeSellerData = await Seller.findOne({_id: id})
            if(seeSellerData){
                const seller = seeSellerData //store the seller data into a variable
                res.status(302).json({
                    messages: `${seller.personalInfo.firstName} ${seller.personalInfo.lastName} found`,
                    seeSellerData
                })
            }else{
                res.status(404).json({
                    message: "Seller Not found"
                })
            }
        }else{
            res.status(404).json({
                message: "Seller not found"
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
    newSellerRegisterController,
    deleteSellerById,
    editSellerInfo,
    deactivateCustomerById,
    seeAllUserController,
    seeIndividualSellerById
}