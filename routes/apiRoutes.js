const router = require('express').Router();
const db = require('../config/database')



//#region <---------- PROPERTIES ----------> 

// get all
router.get('/properties', (req, res)=>{

    // const {userid} = req.user
    const userid = 6

    db('properties').where({userid: userid}).select()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get properties'}))
})

// get one
router.post('/properties/one', (req, res)=>{
    const {websiteurl} = req.body

    // const {userid} = req.user
    const userid = 6

    db('properties').where({websiteurl: websiteurl}).andWhere({userid: userid}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get property'}))
})

// post
router.post('/properties', (req, res)=>{
    // const {userid} = req.user
    const userid = 6

    const { websiteurl, address, imageurl, price, bedrooms, bathrooms, note} = req.body


    db('properties').insert({
        websiteurl: websiteurl,
        address: address,
        imageurl: imageurl,
        price: price,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        note: note,
        userid: userid
    })
        .then((data)=>res.json({isSuccess: true, details: 'Property added'}))
        .catch(e => {
            console.log(e)
            res.status(400).json({isSuccess: false, details: 'Unable add the property'})
        })
})

// update
router.put('/properties/:propertyId', (req, res)=>{
    const propertyId = req.params.propertyId

    // const {userid} = req.user
    const userid = 6

    const { websiteurl, address, imageurl, price, bedrooms, bathrooms} = req.body

    db('properties').where({id: propertyId}).andWhere({userid: userid}).update({
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

    // const {userid} = req.user
    const userid = 6

    db('properties').where({id: propertyId}).andWhere({userid: userid}).del()
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


//#region <---------- RATINGS ----------> 

// get all
router.get('/ratings', (req, res)=>{

    // const {userid} = req.user
    const userid = 6

    db('ratings').where({userid: userid}).select()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get ratings'}))
})

// get one
router.get('/ratings/:ratingId', (req, res)=>{
    const ratingId = req.params.ratingId

    // const {userid} = req.user
    const userid = 6

    db('ratings').where({id: ratingId}).andWhere({userid: userid}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get rating'}))
})

// post
router.post('/ratings', (req, res)=>{
    // const {userid} = req.user
    const userid = 6

    const { ratingoption, rating, propertyid } = req.body


    db('ratings').insert({
        ratingoption: ratingoption,
        rating: rating,
        propertyid: propertyid,
        userid: userid
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating added'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable add the rating'}))
})

// update
router.put('/ratings/:ratingId', (req, res)=>{
    const ratingId = req.params.ratingId

    // const {userid} = req.user
    const userid = 6

    const { ratingoption, rating, propertyid } = req.body


    db('ratings').where({id: ratingId}).andWhere({userid: userid}).update({
        ratingoption: ratingoption,
        rating: rating,
        propertyid: propertyid,
        userid: userid,
        dateupdated: new Date()
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating updated'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to update rating'}))
    
})

// delete
router.delete('/ratings/:ratingId', (req, res)=>{
    const ratingId = req.params.ratingId

    // const {userid} = req.user
    const userid = 6

    db('ratings').where({id: ratingId}).andWhere({userid: userid}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Rating deleted'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to delete rating'}))
})

//#endregion


//#region <---------- RATING CATEGORIES ----------> 

// get all
router.get('/ratingcategories', (req, res)=>{


    db('ratingcategories').select()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get rating categories'}))
})

// get one
router.get('/ratingcategories/:ratingCategoriesId', (req, res)=>{
    const ratingCategoriesId = req.params.ratingCategoriesId


    db('ratingcategories').where({id: ratingCategoriesId}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to get rating category'}))
})

// post
router.post('/ratingcategories', (req, res)=>{
    const { category } = req.body


    db('ratingcategories').insert({
        category: category
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating category added'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable add rating category'}))
})

// update
router.put('/ratingcategories/:ratingCategoriesId', (req, res)=>{
    const ratingCategoriesId = req.params.ratingCategoriesId

    const { category } = req.body


    db('ratingcategories').where({id: ratingCategoriesId}).update({
        category: category,
        dateupdated: new Date()
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating category updated'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to update rating category'}))
    
})

// delete
router.delete('/ratingcategories/:ratingCategoriesId', (req, res)=>{
    const ratingCategoriesId = req.params.ratingCategoriesId


    db('ratingcategories').where({id: ratingCategoriesId}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Rating category deleted'}))
        .catch(e => res.status(400).json({isSuccess: false, details: 'Unable to delete rating category'}))
})

//#endregion



module.exports = router;