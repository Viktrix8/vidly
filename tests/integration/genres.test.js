const request = require('supertest')
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

describe('/api/genres', () => {
    let server;
    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await server.close()
        await Genre.remove({})
    })

    describe("GET /", () => {
        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' },
            ])
            const response = await request(server).get('/api/genres')
            expect(response.status).toBe(200)
            expect(response.body.length).toBe(2)
            expect(response.body.some(g => g.name === 'genre1')).toBeTruthy()
            expect(response.body.some(g => g.name === 'genre2')).toBeTruthy()
        })
    })

    describe("GET /:id", () => {
        it('should return a genre if valid id is passed', async () => {
            const genre = await new Genre({ name: 'genre1' }).save()

            const response = await request(server).get(`/api/genres/${genre._id}`)

            expect(response.status).toBe(200)
            expect(response.body).toMatchObject({ name: 'genre1', _id: genre._id })
        })
        it('should return 404 if passed invalid id', async () => {
            const response = await request(server).get('/api/genres/1')

            expect(response.status).toBe(404)
        })
        it('should return 404 if no genre with the given id exists', async () => {
            const response = await request(server).get('/api/genres/000000000000000000000000')

            expect(response.status).toBe(404)
        })
    })

    describe('POST /', () => {
        let token;
        let name;

        const exec = async () => {
            return await request(server).post('/api/genres').set('x-auth-token', token).send({ name })
        }

        beforeEach(() => {
            token = new User().generateAuthToken()
            name = 'genre1'
        })

        it("should return 401 if client is not logged in", async () => {
            token = ''

            const response = await exec()

            expect(response.status).toBe(401)
        })
        it('should return 400 if posted genre is less than 5 characters', async () => {
            name = '123'

            const response = await exec()

            expect(response.status).toBe(400)
        })
        it('should return 400 if posted genre is more than 50 characters', async () => {
            name = String().length = 51

            const response = await exec()

            expect(response.status).toBe(400)
        })
        it('should return the genre if it is valid', async () => {
            const response = await exec()

            expect(response.status).toBe(200)
            expect(response.body).toMatchObject({ name: 'genre1' })
            expect(response.body).toHaveProperty('_id')
        })
        it('should save the genre in the database', async () => {
            await exec()

            const genre = await Genre.findOne({ name: 'genre1' })

            expect(genre).toMatchObject({ name: 'genre1' })
        })
    })

    describe('PUT /:id', () => {
        let token;
        let name;
        let id;

        const exec = () => {
            return request(server).put(`/api/genres/${id}`).set('x-auth-token', token).send({ name })
        }

        beforeEach(async () => {
            token = new User().generateAuthToken()
            name = 'genre1'
            const genre = await new Genre({ name: 'genre1' }).save()
            id = genre._id
        })

        it('should return 400 if posted genre is less than 5 characters', async () => {
            name = '123'

            const response = await exec()

            expect(response.status).toBe(400)
        })
        it('should return 400 if posted genre is more than 50 characters', async () => {
            name = String().length = 51

            const response = await exec()

            expect(response.status).toBe(400)
        })
        it('should return 404 if no genre with the given id exists', async () => {
            id = '000000000000000000000000'
            const response = await exec()

            expect(response.status).toBe(404)
        })
        it('should return genre if it is valid', async () => {
            const response = await exec()

            expect(response.status).toBe(200)
            expect(response.body).toMatchObject({ name: 'genre1' })
            expect(response.body).toHaveProperty('_id')
        })
        it('should save the genre in the database', async () => {
            await exec()

            const genre = await Genre.findOne({ name: 'genre1' })

            expect(genre).toMatchObject({ name: 'genre1' })
        })
    })

    describe('DELETE /:id', () => {
        let token;
        let id;

        const exec = () => {
            return request(server).delete(`/api/genres/${id}`).set('x-auth-token', token)
        }

        beforeEach(async () => {
            token = new User({ isAdmin: true }).generateAuthToken()
            const genre = await new Genre({ name: 'genre1' }).save()
            id = genre._id
        })

        it('should return 404 if no genre with the given id exists', async () => {
            id = '000000000000000000000000'
            const response = await exec()

            expect(response.status).toBe(404)
        })
        it('should return 401 if client is not logged in', async () => {
            token = ''
            const response = await exec()

            expect(response.status).toBe(401)
        })
        it('should return 403 if client is not an admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken()
            const response = await exec()

            expect(response.status).toBe(403)
        })
        it('should remove the genre from db if valid id is passed', async () => {
            await exec()

            const genre = await Genre.findById(id)

            expect(genre).toBeNull()
        })
        it('should return the removed genre', async () => {
            const response = await exec()

            expect(response.status).toBe(200)
            expect(response.body).toMatchObject({ _id: id })
        })
    })
})