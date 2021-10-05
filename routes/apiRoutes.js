const router = require('express').Router();
const db = require('../config/database')




//#region <---------- PROPERTIES ----------> 

// get all
router.get('/properties', (req, res)=>{

    const userid = req.user.id
    

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

    const userid = req.user.id
    

    db('userproperties').where({userid: userid}).select()
        .then((data)=>res.json({isSuccess: true, data: data}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user properties'})})
})

// get one
router.post('/userproperties/one', (req, res)=>{
    const websiteurl = req.body.websiteurl

    const userid = req.user.id
    

    db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).select().first()
        .then((data)=>res.json({isSuccess: true, data: data}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
})

// post
router.post('/userproperties', (req, res)=>{
    const userid = req.user.id
    

    const { websiteurl } = req.body
    console.log(websiteurl)
    


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
router.delete('/userproperties', (req, res)=>{
    const websiteurl = req.body.websiteurl

    const userid = req.user.id
    

    db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).del()
        .then(()=> {
            db('ratings').where({websiteurl: websiteurl}).andWhere({userid: userid}).del()
                .then((data)=> res.json({isSuccess: true, details: 'User property deleted'}))
                .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to delete user property'})})
        })
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to delete user property'})})
})

// add note
router.put('/userproperties/note', (req, res)=>{

    const userid = req.user.id
    

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

    const userid = req.user.id
    

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
    const userid = req.user.id
    

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

    const userid = req.user.id
    

    const { websiteurl, viewing_date, viewing_time, viewing_address, dashboardlocation } = req.body



    db('userproperties').where({websiteurl: websiteurl}).andWhere({userid: userid}).update({
        viewing_date: viewing_date,
        viewing_time: viewing_time,
        viewing_address: viewing_address,
        dateupdated: new Date()
    })
        
        .then(()=> {
            if ( viewing_address && viewing_date && viewing_time && dashboardlocation === 'to_view'){
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


    const userid = req.user.id
    

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
router.get('/ratingoptions/:ratingCategory', (req, res)=>{
    const ratingCategory = req.params.ratingCategory

    console.log(ratingCategory)

    db('ratingoptions').where({ratingcategory: ratingCategory}).select()
        .then((data)=>{
            let optionsArray = []
            for (let i=0; i<data.length; i++){
                optionsArray.push(data[i].ratingoption)
            }

            res.json({isSuccess: true, data: optionsArray})
        })
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
    const userid = req.user.id
    

    db('ratings').where({userid: userid}).andWhere({websiteurl: websiteurl}).andWhere({ratingoption: ratingoption}).select('rating').first()
        .then((data)=>res.json({isSuccess: true, data: data.rating}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get rating'})})
})

// get all ratings and rating options for website
router.post('/ratings/all', (req, res)=>{

    const { websiteurl } = req.body
    const userid = req.user.id
    

    db('ratings').where({userid: userid}).andWhere({websiteurl: websiteurl}).select('rating', 'ratingoption').orderBy('id')
        .then((data)=> res.json({isSuccess: true, data: data}))
            .catch(e => {{console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get rating'}); console.log(e)}})
})


// post
router.post('/ratings/add', (req, res)=>{
    const userid = req.user.id
    
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
    const userid = req.user.id
    

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

    const userid = req.user.id
    

    db('ratings').where({id: ratingId}).andWhere({userid: userid}).del()
        .then((data)=>res.json({isSuccess: true, details: 'Rating deleted'}))
            .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to delete rating'})})
})



//#endregion


//#region <---------- RATING CATEGORIES ----------> 

// get all
router.get('/ratingcategories', (req, res)=>{


    db('ratingcategories').select('category').limit(5)
        .then((data)=>{
            let categoriesArray = []
            for (let i=0; i<data.length; i++){
                categoriesArray.push(data[i].category)
            }

            res.json({isSuccess: true, data: categoriesArray})
        })
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

    const userid = req.user.id
    

    db('users').where({id: userid}).select('ratingoption1','ratingoption2','ratingoption3','ratingoption4')
        .then((data)=>res.json({isSuccess: true, data: data[0]}))
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
})

// get top rated homes
router.get('/userproperties/:location', (req, res)=>{

    const location = req.params.location
    const userid = req.user.id
    

    db('userproperties').where({userid: userid}).andWhere({dashboardlocation: location}).orderBy('id').select('*')
        .then((data)=>res.json({isSuccess: true, data: data}))
        .catch(e => {console.log(e); res.status(400).json({isSuccess: false, details: 'Unable to get user property'})})
})

// update user settings
router.put('/user', (req, res)=>{
    const userid = req.user.id
    

    const { buyertype, movingwith, budget, ratingoption1, ratingoption2, ratingoption3, ratingoption4, email_contact, sms_contact, post_contact } = req.body


        const updateUserSettings = () => {
            return db('users').where({id: userid}).update({
                buyertype: buyertype,
                movingwith: movingwith,
                budget: budget,
                ratingoption1: ratingoption1,
                ratingoption2: ratingoption2,
                ratingoption3: ratingoption3,
                ratingoption4: ratingoption4,
                email_contact: email_contact,
                sms_contact: sms_contact,
                post_contact: post_contact,
                dateupdated: new Date()
            })
                
        }

        const insertUnratedRating = (newRatingOption, websiteUrl, userId) => {
            db('ratings').insert({
                ratingoption: newRatingOption,
                rating: 'Unrated',
                websiteurl: websiteUrl,
                userid: userId
            })
                .then(data => console.log('new rating inserted'))
                .catch(console.log)
        }

        const checkIfRatingExists = (newRatingOption, websiteUrl, userId) => {
            return db('ratings').where({userid: userId}).andWhere({websiteurl: websiteUrl}).andWhere({ratingoption: newRatingOption}).select().first()
                .then(rating => {
                    if (rating === undefined){
                        return false
                    }
                })
        }

        const getUsersPropertyUrls = (userId) => {
            return db('userproperties').where({userid: userId}).select('websiteurl')
                .then(userProperties => {
                    let websiteUrls = []
                    for (let i=0; i<userProperties.length; i++){
                        const websiteurl = userProperties[i].websiteurl
                        websiteUrls.push(websiteurl)
                    }
                    return websiteUrls
                })
                .catch(console.log)
        }



        
        db('users').where({id: userid}).select().first()
            .then(user => {
                const newRatingOptions = [ratingoption1, ratingoption2, ratingoption3, ratingoption4]


                for (let i=0; i<4; i++){
                    const currentRatingOption = user[`ratingoption${i+1}`]
                    const newRatingOption = newRatingOptions[i]


                    if (currentRatingOption !== newRatingOption){
                        getUsersPropertyUrls(userid)
                            .then(propertyUrls =>{
                                for (let i=0; i<propertyUrls.length; i++){
                                    const websiteUrl = propertyUrls[i]

                                    checkIfRatingExists(newRatingOption, websiteUrl, userid)
                                        .then(exists => {
                                            if (!exists){
                                                insertUnratedRating(newRatingOption, websiteUrl, userid)
                                                    
                                            }
                                        })
                                        .catch(e=> res.status(400).json({isSuccess: false, details: 'Unable update user settings'}))
                                }
                            })
                            .catch(e=> res.status(400).json({isSuccess: false, details: 'Unable update user settings'}))
                    }
                }
                
                updateUserSettings()
                    .then(()=> res.json({isSuccess: true, details: 'User settings updated'}))
                    .catch(e=> res.status(400).json({isSuccess: false, details: 'Unable update user settings'}))

            })
            .catch(e=> res.status(400).json({isSuccess: false, details: 'Unable update user settings'}))
            
        
        
        
        

    
})


// TOTAL NUMBERS
router.get('/total', (req, res)=>{
    
    let object = []

    console.log('total')


    db('users').count('id')
        .then(users => 
            db('users').where({email_contact: true}).count('id')
                .then(marketing => 
                    db('userproperties').count('id')
                        .then(properitesRated => 
                                db('userproperties').where({dashboardlocation: 'viewed'}).count('id')
                                    .then(viewed => 
                                        db('userproperties').where({dashboardlocation: 'offers'}).count('id')   
                                            .then(offers => {
                                                object = [
                                                    {
                                                        title: 'Total Users',
                                                        count: users[0].count
                                                    },
                                                    {
                                                        title: 'Total Marketing',
                                                        count: marketing[0].count
                                                    },
                                                    {
                                                        title: 'Total Properties Rated',
                                                        count: properitesRated[0].count
                                                    },
                                                    {
                                                        title: 'Total Viewed Properties',
                                                        count: viewed[0].count
                                                    },
                                                    {
                                                        title: 'Total Offers Made',
                                                        count: offers[0].count
                                                    },
                                                ]

                                                res.json({isSuccess: true, data: object})
                                            })
                                            .catch(total => res.status(400).json({isSuccess: false, data: null}))
                                    )
                                    .catch(total => res.status(400).json({isSuccess: false, data: null}))
                        )
                        .catch(total => res.status(400).json({isSuccess: false, data: null}))
                )
                .catch(total => res.status(400).json({isSuccess: false, data: null}))
        )
        .catch(total => res.status(400).json({isSuccess: false, data: null}))

})







module.exports = router;