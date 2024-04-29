let express = require('express');
let router = express.Router();
let Board = require('./board.js');
let db = require('./dataAccess.js');

router.get('/new', async (req, res) => {
    // generate new code for the game.
    let code = await db.generateCode();
    console.log("Code: " + code);
    // for the moment, 6 rows and 5 columns
    let b = new Board({"columns": 5, "rows" : 6}, code);
    let resjson = {
        "board": b.board,
        "score": b.score,
        "possibleMoves": b.possibleMoves,
        "code": b.code
    };
    req.session.game = b;
    let dbstatus = await db.save(b.board, b.score, b.movecount, b.code);
    if (dbstatus !== 100) {
        res.send({"error": 777});
        return;
    }
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
        "board": b.board,
        "score": b.score,
        "possibleMoves": b.possibleMoves,
        "code": b.code
    };
    req.session.game = b;
    res.send(resjson);
});

router.post('/move', async (req, res) => {
    let moves = req.body.moves;
    let resu = req.session.game.executeMove(moves);
    if (resu != 100) {
        res.send({"error": resu});
        return;
    }
    let resjson = {
        "board": req.session.game.board,
        "score": req.session.game.score,
    };

    // Guardar cada 3 turnos
    if (req.session.game.movecount % 3 === 0) {
        await db.save(req.session.game.board, req.session.game.score, req.session.game.movecount, req.session.game.code);
    }

    res.send(resjson);
});



module.exports = router;