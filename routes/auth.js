const bcrypt = require('bcrypt')
const Joi = require('joi')
const { User, passwordOptions } = require('../models/user')
const passwordComplexity = require("joi-password-complexity");
const validateHandler = require('../middleware/validate')
const express = require('express')
const router = express.Router()

router.post('/', validateHandler(validate), async (req, res) => {
    const { email, password } = req.body

    let user = await User.findOne({ email })
    if (!user) return res.status(400).send('Invalid email or password.')

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.status(400).send('Invalid email or password.')

    const token = user.generateAuthToken()
    res.send(token)
})

function validate(req) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email().label("Email"),
        password: passwordComplexity(passwordOptions).required().label("Password")
    })

    return schema.validate(req)
}

module.exports = router