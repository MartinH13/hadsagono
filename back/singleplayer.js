let express = require('express');
let router = express.Router();
let Board = require('./board.js');
let db = require('./dataAccess.js');

router.get('/new', async (req, res) => {
    // generate new code for the game.
    let code = await db.generateCode();
    // for the moment, 6 rows and 5 columns
    let b = new Board({"columns": 5, "rows" : 6}, code);
    let resjson = {
        "board": b.board,
        "score": b.score,
        "movecount" : b.movecount,
        "possibleMoves": b.possibleMoves,
        "code": b.code
    };
    req.session.game = resjson;
    let dbstatus = await db.save(b.board, b.score, b.movecount, b.code);
    if (dbstatus !== 100) {
        res.send({"error": 777});
        return;
    }
    console.log("Started NEW game with code: " + b.code)
    res.send(resjson);
    return;
    
});

router.get('/load/:code', async (req, res) => {
    let code = req.params.code;
    let game = await db.load(code);
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
    let resjson = {
        "board": game.board,
        "score": game.score,
        "movecount" : game.movecount,
        "possibleMoves": b.possibleMoves,
        "code": b.code
    };
    req.session.game = resjson;
    res.send(resjson);
});

router.post('/move', async (req, res) => {
    let moves = {"nodes" : req.body.moves};
    let game = req.session.game;
    let b = new Board(game, game.code);
    let resu = await b.executeMove(moves);
    if (resu != 100) {
        res.send({"error": resu});
        return;
    }
    let  resjson = {
        "board": b.board,
        "score": b.score,
    };

    // Guardar cada 3 turnos
    if 
    (b.movecount % 3 === 0) {
        await db.save(b.board, b.score, b.movecount, b.code);
    }
    req.session.game = b;
    res.send(resjson);
});

router.get('/check', (req, res) => {
    res.send(req.session.game.code);
});



module.exports = router;