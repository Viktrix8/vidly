const jwt = require('jsonwebtoken')
const config = require('config')
const { User } = require('../../models/user')
const mongoose = require('mongoose')

describe('generateAuthToken', () => {
    it('should return a valid JWT', async () => {
        const payload = { _id: new mongoose.Types.ObjectId(), isAdmin: false }
        const user = new User(payload)

        const token = user.generateAuthToken()
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'))
        expect(decoded).toMatchObject(payload)

    })
})