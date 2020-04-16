const mongoose = require('mongoose');
const Schema = mongoose.Schema ;

//create EditTransaction Schema and Model
const EditTransactionSchema = new Schema({
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

const EditTransaction = mongoose.model('edit_transaction', EditTransactionSchema)
module.exports = EditTransaction;
