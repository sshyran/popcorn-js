var express = require('express');
var app = express();

app.use(express.static(__dirname + '/'));

var port = 8000;

app.get('/test/method', function (req, res) {
    res.send('{ "method": "get" }');
});

app.post('/test/method', function (req, res) {
    res.send('{ "method": "post" }');
});

app.listen(port);