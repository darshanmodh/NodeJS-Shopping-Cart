var mongoose = require('mongoose');

var categorySchema = mongoose.Schema( {
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    }
});

var Category = module.exports = mongoose.model('Category', categorySchema);