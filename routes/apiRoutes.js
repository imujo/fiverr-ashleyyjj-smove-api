const router = require('express').Router();
const db = require('../config/database')



//#region <---------- PROPERTIES ----------> 

// get all
router.get('/properties', (req, res)=>{

    // const {userid} = req.user
    const userid = 34

    db('properties').where({userid: userid}).select()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get properties'})})
})

// get one
router.post('/properties/one', (req, res)=>{
    const {websiteurl} = req.body


    db('properties').where({websiteurl: websiteurl}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get property'})})
})

// post
router.post('/properties', (req, res)=>{
    const { websiteurl, address, imageurl, price, bedrooms, bathrooms} = req.body


    db('properties').insert({
        websiteurl: websiteurl,
        address: address,
        imageurl: imageurl,
        price: price,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
    })
        .then(()=>{
            db('properties').where({websiteurl: websiteurl}).select().first()
                .then(data => res.json({isSuccess: true, details: 'Property added', propertyid: data.id}))
                .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable add the property'})})
        })
        .catch(e => {
            console.log(e)
            res.status(400).json({isSuccess: false, details: 'Unable add the property'})
        })
})

// update
router.put('/properties/:propertyId', (req, res)=>{
    const propertyId = req.params.propertyId


    const { websiteurl, address, imageurl, price, bedrooms, bathrooms} = req.body

    db('properties').where({id: propertyId}).update({
        websiteurl: websiteurl,
        address: address,
        imageurl: imageurl,
        price: price,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        dateupdated: new Date()
    })
        .then((data)=>res.json({isSuccess: true, details: 'Property updated'}))
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to update property'})})
    
})

// delete
router.delete('/properties/:propertyId', (req, res)=>{
    const propertyId = req.params.propertyId


    db('properties').where({id: propertyId}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Property deleted'}))
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to delete property'})})
})

//#endregion


//#region <---------- USER PROPERTIES ----------> 

// get all
router.get('/userproperties', (req, res)=>{

    // const {userid} = req.user
    const userid = 34

    db('userproperties').where({userid: userid}).select()
        .then((data)=>res.json({isSuccess: true, data: data}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user properties'})})
})

// get one
router.post('/userproperties/one', (req, res)=>{
    const websiteurl = req.body.websiteurl

    // const {userid} = req.user
    const userid = 34

    db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
})

// post
router.post('/userproperties', (req, res)=>{
    // const {userid} = req.user
    const userid = 34

    const { websiteurl } = req.body
    


    db('userproperties').insert({
        websiteurl: websiteurl,
        userid: userid
    })
        .then((data)=>res.json({isSuccess: true, details: 'User property added'}))
        .catch(e => {
            console.log(e)
            res.status(400).json({isSuccess: false, details: 'Unable add the user property'})
        })
})



// delete
router.delete('/userproperties/:userPropertyId', (req, res)=>{
    const userPropertyId = req.params.userPropertyId

    // const {userid} = req.user
    const userid = 34

    db('userproperties').where({id: userPropertyId}).andWhere({userid: userid}).del()
        .then((data)=>res.json({isSuccess: true, details: 'User property deleted'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to delete user property'})})
})

// add note
router.put('/userproperties/note', (req, res)=>{

    // const {userid} = req.user
    const userid = 34

    const { note, websiteurl } = req.body

    console.log(note, websiteurl)

    console.log('UPDATE NOTE')

    db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).update({
        note: note,
        dateupdated: new Date()
    })
        .then((data)=>res.json({isSuccess: true, details: 'User property updated'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to update user property'})})
    
})

// update dashboard location
router.put('/userproperties/dashboardlocation', (req, res)=>{

    // const {userid} = req.user
    const userid = 34

    const { dashboardlocation, websiteurl } = req.body


    console.log('UPDATE DASHBOARD LOCATION')

    db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).update({
        dashboardlocation: dashboardlocation,
        dateupdated: new Date()
    })
        .then((data)=>res.json({isSuccess: true, details: 'Dashboard location updated'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to update dashboard location'})})
    
})

// Does the property need to be moved from unrated to rated?
router.post('/userproperties/move_to_rated', (req, res)=>{

    const { websiteurl } = req.body
    // const {userid} = req.user
    const userid = 34

    db('userproperties').where({userid: userid}).andWhere({websiteurl: websiteurl}).select('dashboardlocation').first()
        .then(data => {
            const dashboardlocation = data.dashboardlocation

            db('ratings').andWhere({websiteurl: websiteurl}).select('rating')
                .then(ratings => {

                    let unratedExists = false;
                    for (let i=0; i<ratings.length; i++){
                        const rating = ratings[i].rating
                        if (rating === 'Unrated') { unratedExists = true }
                    }
                    if (!unratedExists && dashboardlocation === 'unrated'){ res.json(true) }
                    else { res.json(false) }
                })
                .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
        })
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
})

// update viewing details
router.put('/userproperties/viewnigDetails', (req, res)=>{

    console.log('UPDATE VIEWING DETAILS')

    // const {userid} = req.user
    const userid = 34

    const { websiteurl, viewing_date, viewing_time, viewing_address } = req.body



    db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).update({
        viewing_date: viewing_date,
        viewing_time: viewing_time,
        viewing_address: viewing_address,
        dateupdated: new Date()
    })
        
        .then(()=> {
            if ( viewing_address && viewing_date && viewing_time){
                db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).update({
                    dashboardlocation: 'upcoming_viewings'
                })
                    .then((data)=>res.json({isSuccess: true, details: 'Viewing details updated', move: true}))
                    .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to update dashboard location'})})
            }else{
                res.json({isSuccess: true, details: 'Viewing details updated', move: false})
            }
        })
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to update viewing details'})})
    
})

// get viewing details
router.post('/userproperties/viewnigDetails', (req, res)=>{


    // const {userid} = req.user
    const userid = 34

    const { websiteurl } = req.body



    db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).select('viewing_date', 'viewing_time', 'viewing_address').first()
    .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
    
})


//#endregion


//#region <---------- RATING OPTIONS ----------> 

// get all
router.get('/ratingoptions', (req, res)=>{

    db('ratingoptions').select()
        .then((data)=>res.json({isSuccess: true, data: data}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get rating options'})})
})

// get one
router.get('/ratingoptions/:ratingOptionId', (req, res)=>{
    const ratingOptionId = req.params.ratingOptionId

    db('ratingoptions').where({id: ratingOptionId}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get rating option'})})
})

// post
router.post('/ratingoptions', (req, res)=>{
    const { ratingoption, ratingcategory} = req.body


    db('ratingoptions').insert({
        ratingoption: ratingoption,
        ratingcategory: ratingcategory
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating option added'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable add the rating option'})})
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
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to update add rating option'})})
    
})

// delete
router.delete('/ratingoptions/:ratingOptionId', (req, res)=>{
    const ratingOptionId = req.params.ratingOptionId

    db('ratingoptions').where({id: ratingOptionId}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Rating Option deleted'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to delete rating option'})})
})

//#endregion


//#region <---------- RATINGS ----------> 

// get rating by website and ratingoption
router.post('/ratings', (req, res)=>{

    const { websiteurl, ratingoption } = req.body
    // const {userid} = req.user
    const userid = 34

    db('ratings').where({userid: userid}).andWhere({websiteurl: websiteurl}).andWhere({ratingoption: ratingoption}).select('rating').first()
        .then((data)=>res.json({isSuccess: true, data: data.rating}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get rating'})})
})

// get all ratings and rating options for website
router.post('/ratings/all', (req, res)=>{

    const { websiteurl } = req.body
    // const {userid} = req.user
    const userid = 34
    console.log(websiteurl)

    db('ratings').where({userid: userid}).andWhere({websiteurl: websiteurl}).select('rating', 'ratingoption').orderBy('id')
        .then((data)=> res.json({isSuccess: true, data: data}))
            .catch(e => {{console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get rating'}); console.log(e)}})
})


// post
router.post('/ratings/add', (req, res)=>{
    // const {userid} = req.user
    const userid = 34
    console.log('ratings')

    const { ratingoption, rating, websiteurl } = req.body


    db('ratings').insert({
        ratingoption: ratingoption,
        rating: rating,
        websiteurl: websiteurl,
        userid: userid
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating added'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable add the rating'})})
})

// update
router.put('/ratings', (req, res)=>{
    // const {userid} = req.user
    const userid = 34

    const { newrating, ratingoption, websiteurl } = req.body


    db('ratings').where({userid: userid}).andWhere({ratingoption: ratingoption}).andWhere({websiteurl: websiteurl}).update({
        rating: newrating,
        dateupdated: new Date()
    })
        .then((data)=>{console.log(data); res.json({isSuccess: true, details: 'Rating updated'})})
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable update the rating'})})
    
})

// delete
router.delete('/ratings/:ratingId', (req, res)=>{
    const ratingId = req.params.ratingId

    // const {userid} = req.user
    const userid = 34

    db('ratings').where({id: ratingId}).andWhere({userid: userid}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Rating deleted'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to delete rating'})})
})



//#endregion


//#region <---------- RATING CATEGORIES ----------> 

// get all
router.get('/ratingcategories', (req, res)=>{


    db('ratingcategories').select()
        .then((data)=>res.json({isSuccess: true, data: data}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get rating categories'})})
})

// get one
router.get('/ratingcategories/:ratingCategoriesId', (req, res)=>{
    const ratingCategoriesId = req.params.ratingCategoriesId


    db('ratingcategories').where({id: ratingCategoriesId}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get rating category'})})
})

// post
router.post('/ratingcategories', (req, res)=>{
    const { category } = req.body


    db('ratingcategories').insert({
        category: category
    })
        .then((data)=>res.json({isSuccess: true, details: 'Rating category added'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable add rating category'})})
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
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to update rating category'})})
    
})

// delete
router.delete('/ratingcategories/:ratingCategoriesId', (req, res)=>{
    const ratingCategoriesId = req.params.ratingCategoriesId


    db('ratingcategories').where({id: ratingCategoriesId}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Rating category deleted'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to delete rating category'})})
})

//#endregion



// get user rating options
router.get('/user/ratingoptions', (req, res)=>{

    // const {userid} = req.user
    const userid = 34

    db('users').where({id: userid}).select('ratingoption1','ratingoption2','ratingoption3','ratingoption4')
        .then((data)=>res.json({isSuccess: true, data: data[0]}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
})

// get top rated homes

router.get('/userproperties/:location', (req, res)=>{

    const location = req.params.location
    // const {userid} = req.user
    const userid = 34

    db('userproperties').where({userid: userid}).andWhere({dashboardlocation: location}).orderBy('id').select('*')
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
})





module.exports = router;