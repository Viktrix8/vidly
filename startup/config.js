const config = require('config')

function startupConfig() {
    if (!config.get('jwtPrivateKey')) {
        throw new Error("FATAL ERROR: jwtPrivateKey is not defined.")
    }
}

module.exports = startupConfig