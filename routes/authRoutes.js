const passport = require('passport');
const router = require('express').Router();
const genPassword = require('../lib/passwordUtils').genPassword;
const db = require('../config/database')


router.post('/login', passport.authenticate('local'), (req, res)=>{
    if (req.user){
        
        res.json({status: 200, msg: 'Successfully logged in!', user: req.user[0], isauth: true})
    }else{
        res.status(400).json({status: 400, msg: 'Invalid password and/or email', user: {}, isauth: false})
    }
});

router.post('/register', (req, res) => {
    const { email, password, marketing, firstname, lastname } = req.body

    const { salt, hash } = genPassword(password)



    const registerUser = () => {
        db('users').insert({
            firstname: firstname,
            lastname: lastname,
            email: email,
            hash: hash,
            salt: salt,
            marketing: marketing
        })
            .then(() => {
                db.select('*').from('users').where({ email: email })
                    .then(data => res.json({ status: 200, msg: 'User successfully registered.', user: data[0], isauth: true }))
            })
            .catch(() => res.status(400).json({ status: 400, msg: "Couldn't register user.", user: {}, isauth: false }))
    }

    db.select('*').from('users').where({ email: email })
        .then(users => {
            if (users.length > 0) {
                res.status(400).json({ status: 400, msg: 'User already exists. Please enter a different email.', user: {}, isauth: false })
            } else {
                registerUser()
            }
        })



});

router.get('/logout', (req, res) => {

    req.logout();
    req.user = undefined
    res.redirect('/')


})

router.get('/user', (req, res) => {


    // if (req.user){
    //     const userObject = req.user[0]
    //     delete userObject.hash
    //     delete userObject.salt
    //     res.json(userObject)
    // }else{
    //     res.status(400).json({message: 'User not logged in'})
    // }

    db('users').where({id: 34}).select().first()
        .then(data => res.json(data))
        .catch(data => res.status(400).json(null))


})

router.put('/usersetup', (req, res) => {
    const { buyertype, movingwith, budget } = req.body

    // const {email} = req.user
    const email = 'ivo@gmail.com'

    db('users').where({ email: email }).update({
        buyertype: buyertype,
        movingwith: movingwith,
        budget: budget
    }).then(() => res.json('working'))
        .catch(e => res.json(e))
})

router.put('/ratingsetup', (req, res) => {
    const { ratingoption1, ratingoption2, ratingoption3, ratingoption4 } = req.body

    // const {email} = req.user
    const email = 'ivo@gmail.com'

    db('users').where({ email: email }).update({
        ratingoption1: ratingoption1,
        ratingoption2: ratingoption2,
        ratingoption3: ratingoption3,
        ratingoption4: ratingoption4
    }).then(() => res.json('success'))
        .catch(e => res.status(400).json(e))

})

module.exports = router;