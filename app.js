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

USER PROPERTIES
|
|----- id
|----- propertyId
|----- userId
|----- dashbord location
|----- 

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
const db = require('./config/database')
const passport = require('passport');
const path = require('path')

const authRoutes = require('./routes/authRoutes')
const apiRoutes = require('./routes/apiRoutes')
const adminRoutes = require('./routes/adminRoutes')


require('dotenv').config();

const app = express()

// app.use(express.static('public'));

require('./config/passport')(passport);




// INITIALIZING PASSPORT
app.use(passport.initialize())

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())



app.use('/auth', authRoutes)
app.use('/api', passport.authenticate('jwt', { session: false }), apiRoutes)
app.use('/admin', adminRoutes)




app.listen(5000, ()=>{
    console.log('App running on port 5000')
})
