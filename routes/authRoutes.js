const passport = require('passport');
const router = require('express').Router();
const genPassword = require('../lib/passwordUtils').genPassword;
const db = require('../config/database')
const jwtUtils = require('../lib/jwtUtils');
const passwordUtils = require('../lib/passwordUtils');
const addUserToMailchimp = require('../lib/mailchimpUtils').addUserToMailchimp
const crypto = require("crypto")
const bcrypt = require("bcrypt")
const sendEmail = require('../lib/sendEmail')


router.post('/login', (req, res)=>{
    const { email, password } = req.body
    email = email.toLowerCase()
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
    email = email.toLowerCase()

    const { salt, hash } = genPassword(password)

    let email_contact = false;
    let sms_contact = false;
    let post_contact = false;

    if (marketing){
        email_contact = true;
        sms_contact = true;
        post_contact = true;

        
        // MAILCHIMP
        addUserToMailchimp(email, firstname, lastname)
        
        


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

router.post('/req-pswrd-reset', (req, res)=>{

    const deleteToken = (email) => {
        db('users').where({email: email}).update({reset_token: null})

    }

    const email = req.body.email

    db('users').where({email: email}).first()
        .then(user => {
            // does user exist
            if (!user) { res.status(400).json({isSuccess: false, details: 'User does not exist'}) }

            const token = user.reset_token

            // delete token if exists
            if (token){
                deleteToken(email)
            }

            // create a new reset token and hash it
            let resetToken = crypto.randomBytes(32).toString("hex")
            bcrypt.hash(resetToken, Number(process.env.BCRYPT_SALT))
                .then(hash =>{
                    // store hash in the database
                    db('users').where({email: email}).update({
                        reset_token: hash
                    })
                        .then(()=>{
                            // create the link
                            const link = `dashboard.mysmove.com/passwordReset?token=${resetToken}&id=${user.id}`
                
                            // send email with unhashed token and user id
                            sendEmail(email, "Password Reset Request", {name: user.firstname, link: link}, "template/resetPassword.handlebars")
                
                            res.json({isSuccess: true})
        
                        })
                        .catch(e =>{
                            console.log(e)
                            res.status(400).json({isSuccess: false, details: 'Could not set user token'})
                        })

                })
                .catch(e =>{
                    console.log(e)
                    res.status(400).json({isSuccess: false, details: 'Could not hash token'})
                })




        })
        .catch((e)=> {console.log(e); res.status(400).json({isSuccess: false, details: 'Could not get user from database'})})

})

router.post('/reset-password', (req, res)=>{

    const { userId, reset_token, password } = req.body

    db('users').where({id: userId}).first()
        .then(user => {

            // does user have token
            if (!user.reset_token) { res.status(400).json({isSuccess: false, details: 'User does not have a token'}) }

            // if token from database = token from link
            console.log(reset_token, user.reset_token)
            bcrypt.compare(reset_token, user.reset_token)
                .then(isValid => {
                    console.log(isValid)
                    if (!isValid){
                        res.status(400).json({isSuccess: false, details: 'Token is not valid'})
                    }
        
                    // gen salt and hash from new password and update user
                    const { salt, hash } = genPassword(password)
        
                    db('users').where({id: userId}).update({
                        hash: hash,
                        salt: salt,
                        reset_token: null
                    })
                        .then(() => res.json({isSuccess: true}))
                        .catch(() => res.status(400).json({isSuccess: false, details: 'Could not update password'}))
        
                })
                .catch((e)=> {console.log(e); res.status(400).json({isSuccess: false, details: 'Could not get user from database'})})
                    
                })


})



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

router.delete('/user/:userid', (req, res) => {

    const userid = req.params.userid

    try {

        db('users').where({id: userid}).del()
            .then(r => {
                console.log(r)
                db('userproperties').where({userid: userid}).del()
                    .then(()=>{
                        db('ratings').where({userid: userid}).del()
                            .then(() => res.json({ isSuccess: true }))
                            .catch(e => res.status(400).json({ isSuccess: false}))
                    })
            })
            
        
    } catch (error) {
        console.log("Couldn't delete userproperties")
        res.status(400).json({ isSuccess: false})
    }

    
})

router.delete('/mailchimp/remove', (req, res)=>{

    const email = req.body.email

    removeUserFromMailchimp(email, res)
})

router.put('/mailchimp/resubscribe', (req, res)=>{

    const email = req.body.email

    resubscribeListMember(email, res)
})


module.exports = router;