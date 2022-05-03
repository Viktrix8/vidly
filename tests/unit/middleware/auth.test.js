const mongoose = require('mongoose')
const { User } = require('../../../models/user')
const auth = require('../../../middleware/auth')

describe('auth middleware', () => {
    it('should populate req.user with valid JWT', async () => {
        const payload = {
            _id: new mongoose.Types.ObjectId(),
            isAdmin: true
        }
        const token = new User(payload).generateAuthToken()

        const res = {}
        const req = {
            header: jest.fn().mockReturnValue(token),
            user: null
        }
        const next = jest.fn()

        await auth(req, res, next)

        expect(req.user).toMatchObject(payload)
    })
})