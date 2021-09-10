const knex = require('knex')
const fs = require('fs')



require('dotenv').config()

let knexSetup = {}

console.log(process.env.PRODUCTION, process.env.CONNECTION_STRING)

process.env.PRODUCTION === 'true' ?
    knexSetup = {
        client: 'pg',
        connection:{
            connectionString: process.env.CONNECTION_STRING,
            ssl: { rejectUnauthorized: false }
        },
        useNullAsDefault: true,
    }
:
    knexSetup = {
        client: 'pg',
        connection: {
            host : process.env.DATABASE_HOST,
            user : process.env.DATABASE_USERNAME,
            password : process.env.DATABASE_PASSWORD,
            database : process.env.DATABASE_NAME
        },
    }


const db = knex(knexSetup);






 db.select('*').from('users')
    .then(d=>console.log('connected'))
    .catch(e=>console.log(e))


module.exports = db;