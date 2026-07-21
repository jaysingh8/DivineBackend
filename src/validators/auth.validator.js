import {body , validationResult} from "express-validator"



function validationResultReq(req,res,next){
    const errors = validationResult(req);
    console.log(errors);
    
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }
    next()
}

export const registerValidator = [
    body("email")
        .isEmail().withMessage("email is invalid")
        .notEmpty().withMessage("email is required"),

    body("fullname")
        .notEmpty().withMessage("Name is required")
        .isLength({min:3}).withMessage("Name should contain atleast 3 alphabets"),
    body("password")
        .notEmpty().withMessage("password is required")
        .isLength({min:6}).withMessage("password length should be contain atleast 6 letter")
        .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/).withMessage("Password must contain at least one letter, one number, and one special character"),
    body("contact")
        .notEmpty().withMessage("contact is required")
        .matches(/^\d{10}$/).withMessage("contact must be a 10 digit number"),
    body("isGetter")
        .isBoolean().withMessage("isGetter must be a boolean value"),
    validationResultReq

]


export const loginValidator = [
    body("email")
        .notEmpty().withMessage("email is required")
        .isEmail().withMessage("email is invalid"),
    body("password")
        .notEmpty().withMessage("password is required"),

    validationResultReq

]