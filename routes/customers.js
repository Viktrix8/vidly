const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { Customer, validate } = require('../models/customer')
const validateHandler = require('../middleware/validate')
const validateObjectId = require('../middleware/validateObjectId')

router.get('/', async (req, res) => {
    const customers = await Customer.find().sort('name')
    res.send(customers)
})

router.get("/:id", validateObjectId, async (req, res) => {
    const customer = await Customer.findById(req.params.id)
    if (!customer) return res.status(404).send("Customer with given ID was not found.")

    res.send(customer)
})

router.put('/:id', [auth, validateHandler(validate), validateObjectId], async (req, res) => {
    const { name, phone, isGold } = req.body
    const customer = await Customer.findByIdAndUpdate(req.params.id, {
        name,
        phone,
        isGold
    }, { new: true })

    if (!customer) return res.status(404).send("Customer with given ID was not found.")
    res.send(customer)
})

router.post('/', validateHandler(validate), async (req, res) => {
    const { name, phone, isGold } = req.body
    const customer = new Customer({
        name,
        phone,
        isGold
    })
    await customer.save()
    res.send(customer)
})

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id)
    if (!customer) return res.status(404).send("Customer with given ID was not found.")

    res.send(customer)
})

module.exports = router