const Admin = require("../../model/User/admin")
const bcrypt = require("bcrypt")
require("dotenv").config()
const adminValidation = require("../../../validation/User/adminValidation");
const User = require("../../model/User/user");
const { id } = require("../../../validation/User/adminValidation");
const {singleImageUploader} = require("../../../utils/singleFileUploader.js")
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')

//env file data
const jwtSecreteKey = process.env.JWT_TOKEN //get the token security from env file
const mailUserName = process.env.USER //get hte user name of the mail
const mailPassword = process.env.PASSWORD //get the password from env file

//create a admin controller
const createAdminController = async (req, res) => {
    try{
        // console.log(req.body);
        const {error} = adminValidation.validate(req.body) //validate the data
        if(error){
            res.json({
                message: "Validation error",
                error
            })
            // console.log(error);
        }else{
            console.log(`hello`);
            const {password, personalInfo, userType, profileImage} = req.body //get the data from body
            const userId = "ADM"
            const {base64, size} = profileImage //get the data from  body
            //user id generator part start
            const {dateOfBirth, email} = req.body.personalInfo
            const isEmailAvailable = await User.findOne({email}) //check email is exist or not

            if(isEmailAvailable){ //if the email is exist in user schema then it will execute
                res.json({
                    message: "email is exist please use another new email"
                })
            }else{
                const birthYear = dateOfBirth.split('-')[0] //get the birth year 
                const splitBirthDate = dateOfBirth.split("-")
                const birthDate = splitBirthDate[splitBirthDate.length - 1] //get the birth date
                const newUserId = birthYear + userId + birthDate //create new user id

                //hash the password
                const hashedPassword = await bcrypt.hash(password, 10) //hashed the password

                //profile image part
                const profileImageData = {
                    base64,
                    size
                } //sent the data in this format
                const acceptedFormat = ["jpeg", 'jpg', 'ping']
                const uploadImage = singleImageUploader(profileImageData, acceptedFormat) //upload the image
                const {fileAddStatus, fileUrl, extensionValidation} = uploadImage //get the status of the
                console.log(uploadImage);
                //one time code generator
                let oneTimeCode = ""
                for(let i = 1 ; i<=4 ; i++ ){
                    oneTimeCode = Math.floor(Math.random() * 9 + 1) + oneTimeCode // 5 9  3 5  4
                } //generate the onetime Code number
                if(fileAddStatus) {
                     
                    if(extensionValidation) {
                        const imageFile = fileUrl //get the file url 
                        //store the data in to data base
                        const storeData = new Admin({
                            ...req.body,
                            password: hashedPassword,
                            userId: newUserId,
                            "personalInfo.profileImage": imageFile
                        }) //store the data in to date base
                        
                        //save the data
                        const isSaved = await storeData.save() //save the data into the data base
                        if(isSaved){
                            const saveData = isSaved //store the data into a variable

                            const id = saveData._id //get the id from saveUserData
                            const {email} = saveData.personalInfo //get the email of the saved data
                            const {userType} = saveData //get the userType 

                            //update the one time code into schema
                            const updateToken = await Admin.updateOne(
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
                                                userType: "admin" ,
                                                "email" : email
                                            })
                                            const saveUserData = await createUser.save() //save the new user data
                                            if(saveUserData){
                                                console.log("User has been created of Admin type");
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
                                message: "User don't save"
                            })
                        }
                    }else {
                        res.json({
                            message: "Only jpg jpeg and png file are allowed"
                        })
                    }
                }else {
                    res.json({
                        message: "Image Upload Failed"
                    })
                }
            }
        }    
    }catch(err){
        console.log(err);
        res.json({
            err
        })
    }
}


module.exports = {
    createAdminController
}