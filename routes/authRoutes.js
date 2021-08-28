const passport = require('passport');
const router = require('express').Router();
const genPassword = require('../lib/passwordUtils').genPassword;
const db = require('../config/database')
const jwtUtils = require('../lib/jwtUtils');
const passwordUtils = require('../lib/passwordUtils');





router.post('/login', (req, res)=>{
    const { email, password } = req.body
    console.log('login')

    db('users').where({email: email}).select().first()
        .then(user => {
            
            if (!user) {
                res.status(401).json({status: 401, msg: "Could not find the user", user: undefined})
            }else{

                const isValid = passwordUtils.validatePassword(password, user.hash, user.salt)
    
    
                if (isValid){
    
                    const tokenObject = jwtUtils.issueJWT(user)
    
                    res.json({isSuccess: true, msg: 'Successfully logged in!', user: req.user, token: tokenObject.token, expiresIn: tokenObject.expires})
    
                }else{
                    res.status(400).json({isSuccess: false, msg: 'Invalid password and/or email', user: undefined, token: undefined, expiresIn: undefined})
                }
            
            }

        })
        .catch(err => res.status(400).json({isSuccess: false, msg: 'Could not log in the user', user: undefined, token: undefined, expiresIn: undefined}))
})



router.post('/register', (req, res) => {
    const { email, password, marketing, firstname, lastname } = req.body

    const { salt, hash } = genPassword(password)

    let email_contact = false;
    let sms_contact = false;
    let post_contact = false;

    if (marketing){
        email_contact = true;
        sms_contact = true;
        post_contact = true;
    }

    const userAlreadyExists = (email) => {
        return db('users').where({email: email})
            .then(user => {
                return user.length ? true : false
            })
            .catch(err => {console.log(err); return null})
    }
    


    userAlreadyExists(email)
        .then(exists => {
            if (exists){
                return res.status(400).json({ isSuccess: false, msg: "User with that email already exists.", user: undefined, token: undefined, expiresIn: undefined})
            }

            db('users').insert({
                firstname: firstname,
                lastname: lastname,
                email: email,
                hash: hash,
                salt: salt,
                email_contact: email_contact,
                sms_contact: sms_contact,
                post_contact: post_contact
                
            })
                .then(() => {
                    db.select().from('users').where({ email: email }).first()
                        .then(user => {
                            
                            const jwt = jwtUtils.issueJWT(user)
                            
                            res.json({ isSuccess: true, msg: 'User successfully registered.', user: user, token: jwt.token, expiresIn: jwt.expires})
                        })
                })
                .catch(() => res.status(400).json({ isSuccess: false, msg: "Couldn't register user.", user: undefined, token: undefined, expiresIn: undefined}))
        })
    
    





});



router.use(passport.authenticate('jwt', { session: false }))



router.get('/user', (req, res) => {

    let user = req.user

    delete user.hash
    delete user.salt

    res.json(user)

})

router.get('/authenticated', (req, res) => {
    res.json(req.isAuthenticated)

})

router.put('/usersetup', (req, res) => {
    const { buyertype, movingwith, budget } = req.body

    const {email} = req.user

    db('users').where({ email: email }).update({
        buyertype: buyertype,
        movingwith: movingwith,
        budget: budget
    }).then(() => res.json({ success: true }))
        .catch(e => res.status(400).json({ success: false}))
})

router.put('/ratingsetup', (req, res) => {
    const { ratingoption1, ratingoption2, ratingoption3, ratingoption4 } = req.body

    const {email} = req.user

    db('users').where({ email: email }).update({
        ratingoption1: ratingoption1,
        ratingoption2: ratingoption2,
        ratingoption3: ratingoption3,
        ratingoption4: ratingoption4
    }).then(() => res.json({ success: true}))
        .catch(e => res.status(400).json({ success: false}))

})

module.exports = router;