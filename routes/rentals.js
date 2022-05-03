const express = require('express')
const Fawn = require('fawn')
const { Customer } = require('../models/customer')
const { Movie } = require('../models/movie')
const router = express.Router()
const { validate, Rental } = require('../models/rental')
const validateHandler = require('../middleware/validate')
const validateObjectId = require('../middleware/validateObjectId')

Fawn.init('mongodb://localhost/vidly')

router.get('/', async (req, res) => {
    const rentals = await Rental.find().sort('-dateOut')
    res.send(rentals)
})

router.get('/:id', validateObjectId, async (req, res) => {
    const rental = await Rental.findById(req.params.id)
    if (!rental) return res.status(404).send('The rental with the given ID was not found.')
    res.send(rental)
})

router.post('/', validateHandler(validate), async (req, res) => {
    const { customerId, movieId } = req.body

    const customer = await Customer.findById(customerId)
    if (!customer) return res.status(404).send('The customer with the given ID was not found.')

    const movie = await Movie.findById(movieId)
    if (!movie) return res.status(404).send('The movie with the given ID was not found.')
    if (movie.numberInStock === 0) return res.status(400).send('Movie is out of stock.')

    const rental = new Rental({
        customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            isGold: customer.isGold
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate,
        },
    })
    try {
        new Fawn.Task()
            .save('rentals', rental)
            .update('movies', { _id: movie._id }, {
                $inc: {
                    numberInStock: -1
                }
            })
            .run()
    } catch (error) {
        return res.status(500).send('Saving rental to database failed.')
    }

    res.send(rental)
})

module.exports = router