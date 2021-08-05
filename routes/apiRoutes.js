const router = require('express').Router();
const db = require('../config/database')


//#region <---------- PROPERTIES ----------> 

// get all
router.get('/properties', (req, res)=>{

    // const {userId} = req.user
    const userId = 6

    db('properties').where({userid: userId}).select()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get properties'}))
})

// get one
router.get('/properties/:propertyId', (req, res)=>{
    const propertyId = req.params.propertyId

    // const {userId} = req.user
    const userId = 6

    db('properties').where({id: propertyId}).andWhere({userid: userId}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get property'}))
})

// post
router.post('/properties', (req, res)=>{
    // const {userId} = req.user
    const userId = 6

    const { websiteurl, address, imageurl, price, bedrooms, bathrooms, note} = req.body


    db('properties').insert({
        websiteurl: websiteurl,
        address: address,
        imageurl: imageurl,
        price: price,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        note: note,
        userid: userId
    })
        .then((data)=>res.json({isSuccess: true, details: 'Propery added'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable add the property'}))
})

// update
router.put('/properties/:propertyId', (req, res)=>{
    const propertyId = req.params.propertyId

    // const {userId} = req.user
    const userId = 6

    const { websiteurl, address, imageurl, price, bedrooms, bathrooms} = req.body

    db('properties').where({id: propertyId}).andWhere({userid: userId}).update({
        websiteurl: websiteurl,
        address: address,
        imageurl: imageurl,
        price: price,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        dateupdated: new Date()
    })
        .then((data)=>res.json({isSuccess: true, details: 'Property updated'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to update property'}))
    
})

// delete
router.delete('/properties/:propertyId', (req, res)=>{
    const propertyId = req.params.propertyId

    // const {userId} = req.user
    const userId = 6

    db('properties').where({id: propertyId}).andWhere({userid: userId}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Property deleted'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to delete property'}))
})

//#endregion


//#region <---------- RATING OPTIONS ----------> 

// get all
router.get('/ratingoptions', (req, res)=>{

    db('ratingoptions').select()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get rating options'}))
})

// get one
router.get('/ratingoptions/:ratingOptionId', (req, res)=>{
    const ratingOptionId = req.params.ratingOptionId

    db('ratingoptions').where({id: ratingOptionId}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get rating option'}))
})

// post
router.post('/ratingoptions', (req, res)=>{
    const { ratingoption, ratingcategory} = req.body


    db('ratingoptions').insert({
        ratingoption: ratingoption,
        ratingcategory: ratingcategory
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating option added'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable add the rating option'}))
})

// update
router.put('/ratingoptions/:ratingOptionId', (req, res)=>{
    const ratingOptionId = req.params.ratingOptionId
    const { ratingoption, ratingcategory} = req.body

    db('ratingoptions').where({id: ratingOptionId}).update({
        ratingoption: ratingoption,
        ratingcategory: ratingcategory,
        dateupdated: new Date()
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating option updated'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to update add rating option'}))
    
})

// delete
router.delete('/ratingoptions/:ratingOptionId', (req, res)=>{
    const ratingOptionId = req.params.ratingOptionId

    db('ratingoptions').where({id: ratingOptionId}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Rating Option deleted'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to delete rating option'}))
})

//#endregion


module.exports = router;