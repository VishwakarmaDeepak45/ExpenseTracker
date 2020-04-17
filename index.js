const express = require("express");
const routes = require('./routes/api');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

//created database ExpenseTracker
mongoose.connect('mongodb://localhost/expenseTracker', {
     useNewUrlParser: true, 
     useFindAndModify: false, 
     useCreateIndex: true, 
     useUnifiedTopology: true 
    });

app.use(bodyParser.json());

app.use('/api',routes);

//error handling middleware
app.use((err, req, res, next)=>{
    res.status(401).send({error: err.message});
})

app.listen(process.env.PORT || 3000 , function(){
    console.log("ExpenseTracker listen to port no : 3000");
})