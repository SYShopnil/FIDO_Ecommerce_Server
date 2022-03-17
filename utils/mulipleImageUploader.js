//Multiple file upload with extension filtering and the file must contain a object that have a base64 data and size
const fs = require('fs')
 
const multipleImageFileUploader = (file, requireExtension) => { //here file contain a object which have a base64 property and size of that file and require extension contain a array 
    let config = {
        dataUrl: `http://localhost:3030`, //set the default data url
        saveDirectory: `${__dirname}/../public`, //set the save directory of the data
        fileName: ``, //set the file name
    }
    let exportData = [];
    let extensionValidationStatus = {}
    let checkExtension = fileFilter(file, requireExtension)
    const {extensionValidation} = checkExtension
    
    if(!extensionValidation){ //if one of the data's  extension is not validated then it will execute
        return {
            extensionValidation: false //this will be return
        }
    }else{  //if all of the data's extension is validated then it will execute
        file.map(rawData => {
            const myFile = rawData //store the file here
            const {base64, size} = myFile //get the data from my data
            const dataExtension = base64.split(';')[0].split('/')[1]  //get the extension of my data 
            const myBase64Data = base64.split(';base64,')[1] //get the base 64 data of my data
            const myFileName = `${config.fileName}${+new Date()}.${dataExtension}` //set the file new name
            const myDataUrl = `${config.dataUrl}/${myFileName}` //set the data new data url
            const saveDirectory = `${config.saveDirectory}/${myFileName}` //which folder does file have been saved
            console.log(saveDirectory);
            // upload the file here
            fs.writeFile(saveDirectory, myBase64Data, {encoding: "base64"}, (err) => {
                if(err){
                    console.log(err);
                    return err
                }else{
                    console.log("File uploaded successfully");
                }
            })
            const myExportData = {
                dataUrl: myDataUrl,
            }
            extensionValidationStatus["extensionValidation"] = true
            exportData.push(myExportData) //store each data into a array
        })
        const finalExportData = {
            ...extensionValidationStatus,
            exportData
        }  //these data will be return
        return finalExportData //this will be return
    }
}
 
const fileFilter = (file, extension) => {
    const myFile = file
    let tracking = [] //track all extension filter boolean status true or false and store it to it
    
    myFile.map(data => {
        const {base64, size} = data //get the data from my data
        const dataExtension = base64.split(';')[0].split('/')[1]  //get the extension of my data 
        const isValid = extension.find(val => val == dataExtension) //check that is it a valid extension or not
        if(isValid){
            tracking.push(true)
        }else{
            tracking.push(false)
        }
    })
    const isNotMatch = tracking.find(ele => ele == false) //find the false value from the tracking array
    if(isNotMatch == false){
        return {
            extensionValidation: false
        }
    }else{
        return{
            extensionValidation: true
        }
    }
}
 
module.exports = {multipleImageFileUploader}