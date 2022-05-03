const express = require('express')
const { Genre, validate } = require('../models/genre')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const validateHandler = require('../middleware/validate')
const validateObjectId = require('../middleware/validateObjectId')

const router = express.Router()

router.get('/', async (req, res) => {
    const genres = await Genre.find().sort('name')
    res.send(genres)
})

router.get('/:id', [validateObjectId], async (req, res) => {
    const genre = await Genre.findById(req.params.id)
    if (!genre) return res.status(404).send('The movie with the given ID was not found.')
    res.send(genre)
})

router.post('/', [auth, validateHandler(validate)], async (req, res) => {
    const genre = new Genre({ name: req.body.name })
    await genre.save()
    res.send(genre)
})

router.put('/:id', [auth, validateHandler(validate), validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true })
    if (!genre) return res.status(404).send("Genre with given ID was not found.")

    res.send(genre)
})

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id)
    if (!genre) return res.status(404).send("Genre with given ID was not found.")

    res.send(genre)
})

module.exports = router