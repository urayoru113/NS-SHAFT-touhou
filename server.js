var express = require('express');
var app = express();
 
//setting middleware
app.use(express.static(__dirname));
 
var server = app.listen(5050);