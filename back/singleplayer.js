let express = require('express');
let router = express.Router();
let board = require('./board.js');

/**
 * Ruta simple para ver si funciona el auth : GET /auth
 */
router.get('/new', function (req, res) {
    res.send('200 OK - API.js router works');
});



module.exports = router;