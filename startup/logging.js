const winston = require('winston')
require('winston-mongodb');
require('express-async-errors')

function logging() {
    new winston.ExceptionHandler(
        winston.add(new winston.transports.File({ filename: 'logfile.log', level: 'error' })),
        winston.add(new winston.transports.Console({ format: winston.format.simple(), prettyPrint: true })),
    )

    process.on('uncaughtException', (ex) => {
        winston.error(ex.message, ex)
        process.exit(1)
    })

    process.on('unhandledRejection', (ex) => {
        winston.error(ex.message, ex)
        process.exit(1)
    })

}

module.exports = logging