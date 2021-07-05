const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    'telegram_guess_bot',
    'root',
    'root',
    {
        host: '77.223.104.158',
        port: '6432',
        dialect: 'postgres'
    }
)