const router = require('express').Router();
const db = require('../config/database')

const perPage = 10

router.get('/noofpages/:table', (req, res)=>{
    
    const table = req.params.table

    db(table).count()
        .then(data =>{
            const count = data[0].count
            const noOfPages = parseInt((count / perPage) + 1)
            let pages = []
            for (let i=0; i<noOfPages; i++){
                pages.push(i+1)
            }
            res.json({isSuccess: true, data: pages})
        })
        .catch(() => res.json({isSuccess: false, data: null}))

})

router.get('/users/:page', (req, res)=>{

    const page = req.params.page

    const range = [(page * perPage)-perPage, page * perPage]

    db('users').select('id', 'email', 'firstname', 'lastname', 'buyertype', 'movingwith', 'budget', 'ratingoption1', 'ratingoption2', 'ratingoption3', 'ratingoption4', 'admin', 'datecreated')
        .then(data => {
            const slicedData = data.slice(range[0], range[1])
            res.json({isSuccess: true, data: slicedData})
        })
        .catch(data => res.json({isSuccess: false, data: null}))
})

router.get('/properties/:page', (req, res)=>{

    const page = req.params.page

    const range = [(page * perPage)-perPage, page * perPage]

    db('properties').select()
        .then(data => {
            const slicedData = data.slice(range[0], range[1])
            res.json({isSuccess: true, data: slicedData})
        })
        .catch(data => res.json({isSuccess: false, data: null}))
})

router.get('/ratingoptions/:page', (req, res)=>{

    const page = req.params.page

    const range = [(page * perPage)-perPage, page * perPage]

    db('ratingoptions').select('id', 'ratingoption', 'ratingcategory', 'dateadded')
        .then(data => {
            const slicedData = data.slice(range[0], range[1])
            res.json({isSuccess: true, data: slicedData})
        })
        .catch(data => res.json({isSuccess: false, data: null}))
})

router.get('/ratingcategories/:page', (req, res)=>{

    const page = req.params.page

    const range = [(page * perPage)-perPage, page * perPage]

    db('ratingcategories').select()
        .then(data => {
            const slicedData = data.slice(range[0], range[1])
            res.json({isSuccess: true, data: slicedData})
        })
        .catch(data => res.json({isSuccess: false, data: null}))
})





module.exports = router;