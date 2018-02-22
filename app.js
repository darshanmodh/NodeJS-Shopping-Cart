var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');

mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.on('open', function() {
    console.log('connected to MongoDB');
});

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.locals.errors = null;

var Page = require('./models/page');
Page.find({}).sort({sorting: 1}).exec(function(err, pages) {
    if(err) console.log(err);
    else app.locals.pages = pages;
});

var Category = require('./models/category');
Category.find(function(err, categories) {
    if(err) console.log(err);
    else app.locals.categories = categories;
});

// express-fileupload
app.use(fileUpload());

// body parser
app.use(bodyParser.urlencoded( {extended: false} ));
app.use(bodyParser.json());

// express-sessions
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    // cookie: { source: true }
}));

// express-validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }

        return {
            param: formParam,
            msg: msg,
            value: value
        };        
    },

    customValidators: {
        isImage: function(value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension) {
                case '.jpg':
                    return '.jpg';
                case '.png':
                    return '.png';
                case '.jpeg':
                    return '.jpeg';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

// express-messages
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages') (req, res);
    next();
});

var pages = require('./routes/pages.js');
var products = require('./routes/products.js');
var adminPages = require('./routes/adminPages.js');
var adminCategories = require('./routes/adminCategories.js');
var adminProducts = require('./routes/adminProducts.js');

// Order matters a lot
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/', pages);

var port = 3000;
app.listen(port, function() {
    console.log('Server started on port ' + port);
});