const express = require("express");
const router = express.Router();
const IncomeExpense = require('../models/income_expense')

// get a list of dashboard from the db
// get a list of income_expense from the db
router.get('/dashboard', (req, res, next) => {
    let type = req.query.transaction_type;
    console.log("type", type)
    if(type == "income"){
        console.log("get total income")
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
    } 
    else if(type == "expense"){
        console.log("get total expense")
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
    else if(type == "total_amount") {
        console.log("get total amount")
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
    else if(type == "5_transaction"){
        console.log("get last 5 transaction")
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
})


// get a list of passbook from the db
// get a list of income_expense from the db
router.get('/passbook', (req, res, next) => {
    let type = req.query.transaction_type;
    console.log("type", type)
    if(type == "all_transaction"){
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
    else if (type == "all_income"){
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
    else if(type == "all_expense"){
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
    else { 
        console.log("month", typeof parseInt(req.query.transaction_type))
        let query = [
            {$project: {
                transaction_type: "$transaction_type",
                transaction_amount : "$transaction_amount", 
                total_amount: "$total_amount",
                month: {$month: '$transaction_date'}}
               },
            {$match: {month: parseInt(req.query.transaction_type)}}
        ];
        IncomeExpense.aggregate(query, function (err, resp) {
            if (err) {
                console.log("err",err);
                return;
            }
            res.status(200).send(resp); 
            res.end();
        }) 
    }
})


// post request api is "Income/Expense"
// add a new expense to the db
router.post('/income_expense', function(req, res, next){
     //check collection is available or not
    IncomeExpense.count({}, function( err, count){
    console.log( "Number of records is: ", count );
    
    if(count > 0){
        //get collections last record
        IncomeExpense.findOne().sort({$natural: -1}).limit(1).exec(function(err, resp){
            if(err){
                console.log("err", err);
            }
            else{
                console.log("last record: ",resp);
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
                    res.end();
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
                res.end();
            })
            .catch(next)
        }
    }
})

})


router.put('/edit_transaction/:id', function(req, res, next){
    // console.log("type", req.body, req.params.id)

    //get edit records data by id
    IncomeExpense.findOne({'_id' : req.params.id },function(err, datas){
        if(err){
            console.log("err",err);
        }else{
            let oldDates = new Date((datas.transaction_date).toString()).getDate();
            let newDates = new Date(Date.now()).getDate();
            if(oldDates == newDates && datas.transaction_type == req.body.transaction_type){
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            //get current days record
            IncomeExpense.find({transaction_date: {$gte: today}}).exec(function(err, resp){
                if(err){
                    console.log("err",err);
                }
                else{
                    resp.forEach((element, index) => {
                        let next = '';
                        if((element._id == req.params.id) || (next == "next")){
                            console.log(element, index, resp.length)

                              if( (req.body.transaction_type == "income" && req.body.transaction_amount > datas.transaction_amount) || next == "next"){
                                  let difference_amt = req.body.transaction_amount - datas.transaction_amount;
                                //get last records of current id for total amount
                                IncomeExpense.findOne({_id: {$lt: element._id}}).sort({_id: -1 }).limit(1).exec(function(err, resp){
                                    if(err){
                                        console.log("err", err);
                                    } else{
                                        console.log("last record: ",resp);
                                        let data = {...req.body, "total_amount": resp.total_amount + difference_amt }
                                            //update query
                                            IncomeExpense.findByIdAndUpdate({_id: element._id}, data)
                                            .then(()=>{
                                                IncomeExpense.findOne({_id: element._id})
                                                .then((result)=>{
                                                    console.log("result", result)
                                                    next = "next";
                                                    res.send(result);
                                                    // res.end();
                                                })
                                                .catch(err=>{
                                                    console.log("Put error :", err)
                                                })
                                            })
                                            .catch(err=>{
                                                console.log("Put error 2:", err)
                                            }) 
                                     }
                                 })
                               }else if(req.body.transaction_type == "income" && req.body.transaction_amount < datas.transaction_amount){
                                   console.log("income amount is not lower then previous income");
                                   res.send({error: "income amount is not lower then previous income"});
                               } 
                               else if(req.body.transaction_type == "expense" && req.body.transaction_amount > datas.transaction_amount){
                                    //get last records of table for total amount 
                                    let total_amount ; 
                                    let difference_amount = req.body.transaction_amount - datas.transaction_amount ;
                                    let previous_total_amount;

                                    //get last records for total amount.
                                    IncomeExpense.findOne().sort({$natural: -1}).limit(1).exec(function(err, resp){
                                        if(err){
                                            console.log("err", err);
                                        } else{
                                            console.log("last record: ",resp);
                                            total_amount = resp.total_amount;
                                        }
                                    })
                                    
                                    //get last records of current id for total amount
                                    IncomeExpense.findOne({_id: {$lt: req.params.id}}).sort({_id: -1 }).limit(1).exec(function(err, resp){
                                        if(err){
                                            console.log("err", err);
                                        } else{
                                            console.log("last record: ",resp);  
                                            previous_total_amount  = resp.total_amount ;                             
                                        }
                                    })

                                    if(total_amount > difference_amount ){
                                        let data = {...req.body, "total_amount":  previous_total_amount - req.body.transaction_amount}
                                        //update query
                                        IncomeExpense.findByIdAndUpdate({_id: req.params.id}, data)
                                        .then(()=>{
                                            IncomeExpense.findOne({_id: req.params.id})
                                            .then((result)=>{
                                                next = "next";
                                                res.send(result);
                                            })
                                            .catch(err=>{
                                                console.log("Put error :", err)
                                            })
                                        }) 
                                    }else{
                                        res.send({error: "totalamount is low"})
                                        console.log("totalamount is low")
                                    }
                               }else if(req.body.transaction_type == "expense" && req.body.transaction_amount > datas.transaction_amount){

                               }
                            //    else{
                            //         console.log("income amount is not less previous income amout")
                            //         res.send({error: 'income amount is not less previous income amout'})
                            //    }   
                        }
                    })
                    // res.send(resp); 
                    res.end();
                }
            });
            }
            else{
                console.log("You can update your transaction current dates only")
                res.send({error: 'You can update your transaction current dates only'})
            }
        }
    });
})


module.exports = router;