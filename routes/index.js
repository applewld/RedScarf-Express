var express = require('express');
var NoticeModel = require("../modal/Notice").NoticeModel;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('<html>hello!</html>')
});

module.exports = router;
