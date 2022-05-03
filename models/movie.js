const mongoose = require('mongoose')
const Joi = require('joi')
const { genreSchema } = require('./genre')

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 5, maxlength: 255, trim: true },
    numberInStock: { type: Number, required: true, min: 0, max: 255 },
    dailyRentalRate: { type: Number, required: true, min: 0, max: 255 },
    genre: { type: genreSchema, required: true }
})

const Movie = mongoose.model("Movie", movieSchema)

function validateMovie(movie) {
    const movieSchema = Joi.object({
        title: Joi.string().min(5).max(255).required().label("Title"),
        numberInStock: Joi.number().min(0).max(255).required().label("Number in Stock"),
        dailyRentalRate: Joi.number().min(0).max(255).required().label("Daily Rental Rate"),
        genreId: Joi.objectId().required().label("Genre Id")
    })

    return movieSchema.validate(movie)
}

exports.Movie = Movie
exports.validate = validateMovie