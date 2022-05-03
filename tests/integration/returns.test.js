const moment = require('moment');
const mongoose = require('mongoose');
const request = require('supertest');
const { Movie } = require('../../models/movie');
const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');

describe('/api/returns', () => {
    let server;
    let customerId;
    let movieId
    let rental;
    let token;
    let movie;

    beforeEach(async () => {
        server = require('../../index')
        token = new User().generateAuthToken()
        customerId = mongoose.Types.ObjectId()
        movieId = mongoose.Types.ObjectId()

        movie = new Movie({
            _id: movieId,
            title: 'movie1',
            genre: { name: 'genre1' },
            numberInStock: 5,
            dailyRentalRate: 2
        })

        rental = new Rental({
            customer: {
                name: mongoose.Types.ObjectId(),
                phone: '12345',
                isGold: true,
                _id: customerId
            },
            movie: {
                title: '12345',
                dailyRentalRate: 2,
                _id: movieId,
            },
        })
        await rental.save()
        await movie.save()
    })

    afterEach(async () => {
        await server.close()
        await Rental.remove({})
        await Movie.remove({})
    })


    describe('POST /api/returns', () => {
        const exec = () => {
            return request(server).post('/api/returns').set('x-auth-token', token).send({ customerId, movieId })
        }

        it('should return 401 if client is not logged in', async () => {
            token = ''

            const res = await exec()

            expect(res.status).toBe(401)
        })

        it('should return 400 if customerId is not provided', async () => {
            customerId = ''

            const res = await exec()

            expect(res.status).toBe(400)
        })

        it('should return 400 if movieId is not provided', async () => {
            movieId = ''

            const res = await exec()

            expect(res.status).toBe(400)
        })

        it('should return 400 if no rental found for the customer/movie', async () => {
            await Rental.remove({})

            const res = await exec()

            expect(res.status).toBe(404)
        })

        it('should return 400 if rental already processed', async () => {
            rental.dateReturned = new Date()
            await rental.save()

            const res = await exec()

            expect(res.status).toBe(400)
        })

        it('should return 200 if request is valid', async () => {
            const res = await exec()

            expect(res.status).toBe(200)
        })
        it('should set the set the dateReturned property', async () => {
            await exec()

            const rentalInDb = await Rental.findById(rental._id)
            const diff = new Date() - rentalInDb.dateReturned
            expect(diff).toBeLessThan(10 * 1000)
        })
        it('should set the rental fee if input is valid', async () => {
            rental.dateOut = moment().add(-7, 'days').toDate()
            await rental.save()

            await exec()

            const rentalInDb = await Rental.findById(rental._id)
            expect(rentalInDb.rentalFee).toBe(14)
        })
        it('should increase the movie stock', async () => {
            await exec()
            const movieInDb = await Movie.findById(movieId)
            expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1)
        })
        it('should return the rental if input is valid', async () => {
            const res = await exec()

            expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['customer', 'movie', 'dateOut', 'dateReturned', 'rentalFee']))
        })
    })
}) 