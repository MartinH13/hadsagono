let express = require('express');
let router = express.Router();
let Board = require('../logic/board.js');
let db = require('../logic/dataAccess.js');
let utils = require('../logic/utils.js');


router.get('/', (req, res) => {
    res.send("LOAD 200 OK");
});



module.exports = router;