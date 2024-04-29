let express = require('express');
let router = express.Router();
let Board = require('./board.js');
let db = require('./dataAccess.js');

router.get('/', (req, res) => {
    res.send("200 OK");
});


module.exports = router;