const Joi = require('joi')
const mongoose = require('mongoose')

const Customer = mongoose.model("Customer", new mongoose.Schema({
    isGold: { type: Boolean, default: false },
    name: { type: String, required: true, minlength: 5, maxlength: 50 },
    phone: { type: String, required: true, minlength: 5, maxlength: 50 },
}))

function validateCustomer(customer) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required().label("Name"),
        phone: Joi.string().min(5).max(50).required().label("Phone"),
        isGold: Joi.boolean().label("Is Gold"),
    })

    return schema.validate(customer)
}


exports.Customer = Customer
exports.validate = validateCustomer