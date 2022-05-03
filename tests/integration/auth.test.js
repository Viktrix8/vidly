const request = require('supertest');
const { Genre } = require('../../models/genre');
const { User } = require('../../models/user');

describe('auth middleware', () => {
    let server;
    let token;

    beforeEach(() => {
        server = require('../../index')
    })

    afterEach(async () => {
        await server.close()
        Genre.collection.deleteMany({})
    })

    const exec = () => {
        return request(server).post('/api/genres').set('x-auth-token', token).send({ name: 'genre1' })
    }

    beforeEach(() => {
        token = new User().generateAuthToken()
    })

    it('should return 401 if no token is provided', async () => {
        token = ''

        const response = await exec()

        expect(response.status).toBe(401)
    })
    it('should return 400 if token is invalid', async () => {
        token = 'a'

        const response = await exec()

        expect(response.status).toBe(400)
    })
})