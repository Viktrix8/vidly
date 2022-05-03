const express = require('express')
const { Genre } = require('../models/genre')
const { Movie, validate } = require('../models/movie')
const auth = require('../middleware/auth')
const validateObjectId = require('../middleware/validateObjectId')
const validateHandler = require('../middleware/validate')
const router = express.Router()

router.get('/', async (req, res) => {
    const movies = await Movie.find().sort('name')
    res.send(movies)
})

router.get('/:id', validateObjectId, async (req, res) => {
    const movie = await Movie.findById(req.params.id)
    if (!movie) return res.status(404).send('The movie with the given ID was not found.')
    res.send(movie)
})

router.delete('/:id', [auth, validateObjectId], async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id)
    if (!movie) return res.status(404).send('The movie with the given ID was not found.')
    res.send(movie)
})

router.put('/:id', [auth, validateHandler(validate), validateObjectId], async (req, res) => {
    const { title, genreId, dailyRentalRate, numberInStock } = req.body

    const genre = await Genre.findById(genreId)
    if (!genre) return res.status(400).send('The genre with the given ID was not found.')

    const movie = await Movie.findByIdAndUpdate(req.params.id, {
        title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        dailyRentalRate,
        numberInStock
    }, { new: true })
    if (!movie) return res.status(404).send('The movie with the given ID was not found.')

    res.send(movie)
})

router.post('/', [auth, validateHandler(validate), validateObjectId], async (req, res) => {
    const { genreId, title, numberInStock, dailyRentalRate } = req.body

    const genre = await Genre.findById(genreId)
    if (!genre) return res.status(400).send('The genre with the given ID was not found.')

    const movie = new Movie({
        title,
        numberInStock,
        dailyRentalRate,
        genre: {
            _id: genre._id,
            name: genre.name
        }
    })

    await movie.save()
    res.send(movie)
})

module.exports = router