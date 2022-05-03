const passwordComplexity = require("joi-password-complexity");
const Joi = require('joi')
const jwt = require('jsonwebtoken')
const config = require('config')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 1024
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
})

userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, config.get('jwtPrivateKey'))
}

const User = mongoose.model("User", userSchema)

const complexityOptions = {
    min: 6,
    max: 255,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1
};

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required().label("Name"),
        email: Joi.string().min(5).max(255).required().email().label("Email"),
        password: passwordComplexity(complexityOptions).required().label("Password")
    })

    return schema.validate(user)
}

module.exports.User = User
module.exports.validate = validateUser
module.exports.passwordOptions = complexityOptions