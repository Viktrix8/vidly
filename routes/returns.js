const express = require('express');
const Joi = require('joi');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate')
const { Movie } = require('../models/movie');
const { Rental } = require('../models/rental')

const router = express.Router()

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId)
    if (!rental) return res.status(404).send('Rental not found.')
    if (rental.dateReturned) return res.status(400).send('Return already processed.')

    await Movie.findByIdAndUpdate(rental.movie._id, {
        $inc: {
            numberInStock: 1
        }
    })

    rental.return()
    await rental.save()

    res.status(200).send(rental)
})

function validateReturn(request) {
    const schema = Joi.object({
        customerId: Joi.objectId().required(),
        movieId: Joi.objectId().required()
    })

    return schema.validate(request)
}

module.exports = router