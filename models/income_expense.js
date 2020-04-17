const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

//create IncomeExpense Schema and Model
const IncomeExpenseSchema = new Schema({
    transaction_type:{
        type: String,
        required:[true, 'transaction_type field is required']
    },
    transaction_desc:{
        type: String,
        required:[true, 'transaction_desc field is required']
    },
    transaction_amount:{
        type : Number,
        required:[true, 'amount field is required']
    },
    total_amount: {
        type : Number,
    },
    transaction_date:{
        type : Date,
        default: Date.now
    },
})

// created table in db and table name is "income_expense"
const IncomeExpense = mongoose.model('income_expense', IncomeExpenseSchema)
module.exports = IncomeExpense;
