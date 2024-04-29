let express = require('express');
let router = express.Router();
let Board = require('./board.js');
let db = require('./dataAccess.js');

router.get('/new', (req, res) => {
    // generate new code for the game
    let code = db.getNewCode();
    // for the moment, 6 rows and 5 columns
    let b = new Board({"columns": 5, "rows" : 5}, code);
    let resjson = {
        "board": b.board,
        "score": b.score,
        "possibleMoves": b.possibleMoves,
        "code": b.code
    };
    req.session.game = b;
    let dbstatus = db.save(b.board, b.score, b.movecount, b.code);
    if (dbstatus !== 100) {
        res.send({"error": 777})
    }
    res.send(resjson);
});

router.get('/load/:code', (req, res) => {
    let code = req.params.code;
    let game = db.load(code);
    // if game is an integer, error code is returned
    if (typeof game === 'number') {
        switch (game) {
            case 281:
                res.send({"error": 281});
                break;
            case 282:
                res.send({"error": 282});
                break;
        }
        return;
    }

    // everything good, load game
    let b = new Board({"board" : game.board, "score": game.score, "movecount": game.movecount} ,code);
});



module.exports = router;