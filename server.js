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

app.listen(port);