const express = require("express");
const router = express.Router();
const Dashboard = require('../models/dashboard')
const EditTransaction = require('../models/edit_transaction')
const IncomeExpense = require('../models/income_expense')
const Passbook = require('../models/passbook')

// get a list of ninjas from the db
router.get('/income_expense', (req, res, next) => {
    let type = req.query.transaction_type;
    console.log("type", type)
    if(type == "income"){
        console.log("income")
        IncomeExpense.aggregate([
            { $match: { transaction_type : 'income' } },
            { $group: { _id: null, transaction_amount: { $sum: "$transaction_amount" } } }
        ], function (err, result) {
            if (err) {
                console.log("err",err);
                return;
            }
            console.log("result",result[0].transaction_amount);
            res.status(200).send(({"total_amount": result[0].transaction_amount})); 
            res.end();
        }) 
    } else if(type == "expense"){
        console.log("expense")
        IncomeExpense.aggregate([
            { $match: { transaction_type : 'expense' } },
            { $group: { _id: null, transaction_amount: { $sum: "$transaction_amount" } } }
        ], function (err, result) {
            if (err) {
                console.log("err",err);
                return;
            }
            console.log("result",result[0].transaction_amount);
            res.status(200).send(({"total_amount": result[0].transaction_amount})); 
            res.end();
        })
    }
    else if(type == "all") {
        console.log("all")
        IncomeExpense.findOne().sort({$natural: -1}).limit(1).exec(function(err, resp){
            if(err){
                console.log("err",err);
            }
            else{
                console.log("last record: ",resp);
                res.status(200).send(({"total_amount": resp.total_amount})); 
                res.end();
            }
        })
    }
    else if(type == "transaction"){
        console.log("transaction")
        IncomeExpense.find().sort({$natural: 1}).limit(5).exec(function(err, resp){
            if(err){
                console.log("err",err);
            }
            else{
                console.log("last record: ",resp);
                res.status(200).send(resp); 
                res.end();
            }
        })
    }
    else if(type == "all transaction"){
        console.log("all transaction")
        IncomeExpense.find().sort({$natural: 1}).exec(function(err, resp){
            if(err){
                console.log("err",err);
            }
            else{
                console.log("last record: ",resp);
                res.status(200).send(resp); 
                res.end();
            }
        })
    }
    else if (type == "all income"){
        console.log("all income")
        IncomeExpense.aggregate([
            { $match: { transaction_type : 'income' } },
        ], function (err, resp) {
            if (err) {
                console.log("err",err);
                return;
            }
            res.status(200).send(resp); 
            res.end();
        }) 
    }
    else if(type == "all expense"){
        console.log("all expense")
        IncomeExpense.aggregate([
            { $match: { transaction_type : 'expense' } },
        ], function (err, resp) {
            if (err) {
                console.log("err",err);
                return;
            }
            res.status(200).send(resp); 
            res.end();
        }) 
    }
    else if(type == "month"){
        console.log("month")
        IncomeExpense.aggregate([
            {$project: { transaction_type: "$transaction_type",
                         transaction_amount : "$transaction_amount", 
                         total_amount: "$total_amount",
                         month: {$month: '$transaction_date'}}},
            {$match: {month: 4}}
        ], function (err, resp) {
            if (err) {
                console.log("err",err);
                return;
            }
            res.status(200).send(resp); 
            res.end();
        }) 
    }
     
    
    // IncomeExpense.findById()
    //     .then(function(results){ 
    //         res.send(results); 
    //     })
    //     .catch(err=>{
    //     })
})

// router.get('/dashboard', function(req, res, next){
//     Dashboard.findById()
//         .then(function(results){ 
//             res.send(results); 
//         })
//         .catch(err=>{
//         })
// })

// router.get('/dashboard', function(req, res, next){
//     Dashboard.findById()
//         .then(function(results){ 
//             res.send(results); 
//         })
//         .catch(err=>{
//         })
// })

// router.get('/dashboard', function(req, res, next){
//     Dashboard.findById()
//         .then(function(results){ 
//             res.send(results); 
//         })
//         .catch(err=>{
//         })
// })




//add a new ninja to the db
router.post('/income_expense', function(req, res, next){
     //check collection is available or not
    IncomeExpense.count({}, function( err, count){
    console.log( "Number of records is: ", count );
    
    if(count > 0){
        //get collections last record
        IncomeExpense.findOne().sort({$natural: -1}).limit(1).exec(function(err, resp){
            if(err){
                console.log(err);
            }
            else{
                console.log("last record: ",resp);
                let totalamount = 0;
                let data;
                if(req.body.transaction_type == 'income'){
                    data = {...req.body, "total_amount": resp.total_amount + req.body.transaction_amount}
                    console.log("asfa totalamount", data.total_amount)
                }
                else{
                    if(req.body.transaction_amount > resp.total_amount){
                        res.send({error: "totalamount is low"})
                        console.log("totalamount is low")
                    }
                    else{
                        data = {...req.body, "total_amount": resp.total_amount - req.body.transaction_amount}
                        console.log("else totalamount", data)
                    }
                }
                IncomeExpense.create(data)
                .then((data)=>{
                    res.send(data)
                })
                .catch(next)
                }
            })
    }
    else{
        if(req.body.transaction_type == 'expense'){
            res.send({error: "totalamount is low"})
            console.log("totalamount is low")
        }else{
            let totalamount = {...req.body, "total_amount": req.body.transaction_amount}
            console.log("elseeeeee totalamount", totalamount)
            IncomeExpense.create(totalamount)
            .then((data)=>{
                res.send(data)
            })
            .catch(next)
        }
    }
})

})










//update a ninja in the db
// router.put('/dashboard/:id', function(req, res, next){
//     Dashboard.findByIdAndUpdate({_id: req.params.id}, req.body)
//     .then(()=>{
//         Ninja.findOne({_id: req.params.id})
//         .then((ninja)=>{
//             res.send(ninja);
//         })
//         .catch(err=>{
//         })
//     })
// })

//delete a ninja from a db
// router.delete('/dashboard/:id', function(req, res, next){
//     Dashboard.findByIdAndRemove({_id: req.params.id})
//     .then((ninja)=>{
//         res.send(ninja);
//     })
//     .catch(err=>{
//     })
// })

module.exports = router;