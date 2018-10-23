var express = require('express');
var app = express();

app.use(express.static(__dirname + '/'));

var port = 8000;

/*
 * Get method for testing purposes.
 * 
 * It replaces old /test/data/method.php
 */
app.get('/test/method', function (req, res) {
    res.send('{ "method": "get" }');
});

/*
 * Post method for testing purposes.
 * 
 * It replaces old /test/data/method.php
 */
app.post('/test/method', function (req, res) {
    res.send('{ "method": "post" }');
});

/*
 * Get method for testing purposes.
 * 
 * It replaces old /test/data/jsonp.php
 */
app.get('/test/jsonp', function (req, res) {
    res.send(req.query.callback + '({ "data": {"lang": "en", "length": 25} });');
});

/*
 * Get method for testing purposes.
 * 
 * It replaces old /test/data/jsonpfancyapi.php
 */
app.get('/test/jsonpfancyapi', function (req, res) {
    var callback = req.questy.callback;

    if (!callback) {
        res.send('Invalid Parameter');
    } else {
        res.send(callback + '({ "data": {"lang": "en", "length": 25} });');    
    }
});

app.listen(port);