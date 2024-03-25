const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  Id: Number, 
  title: String, 
  price: Number,
  description: String, 
  category: String, 
  image: String,
  sold: Boolean, 
  dateOfSale: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        
        return value instanceof Date && !isNaN(value);
      },
      message: 'Invalid date format for dateOfSale'
    }
  }
});


transactionSchema.index({ title: 'text', description: 'text', price: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
