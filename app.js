/*



<-------------- DATABASE -------------->

USER
|
|----- id
|----- first name
|----- last name
|----- email
|----- password
|----- preference selection
|----- buyertype
|----- movingwith
|----- budget
|----- marketing (boolean)
|----- date added
|----- date updated



PROPERTIES
|
|----- id
|----- website url
|----- address
|----- image url
|----- price
|----- bedrooms
|----- bathrooms
|----- note
|----- userId
|----- date added

RATINGS
|
|----- id
|----- rating option
|----- rating
|----- userId
|----- properyId
|----- date added
|----- date updated

RATING OPTIONS
|
|----- id
|----- rating option
|----- category
|----- date added
|----- date updated

RATING CATEGORIES
|
|----- id
|----- category





*/


const express = require('express')
const cors = require('cors')
const session = require('express-session');
const KnexSessionStore = require('connect-session-knex')(session);
const db = require('./config/database')
const passport = require('passport');

const authRoutes = require('./routes/authRoutes')
const apiRoutes = require('./routes/apiRoutes')


const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
// app.use(express.static('public'));


const store = new KnexSessionStore({
    db,
    tablename: 'sessions'
  });

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 3
    },
}))


require('./config/passport');
app.use(passport.initialize())
app.use(passport.session())


app.use('/auth', authRoutes)
app.use('/api', apiRoutes)




app.listen(5000, ()=>{
    console.log('App running on port 5000')
})
