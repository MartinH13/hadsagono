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
    //ESTE DELETE ES IMPORTANTE?????????????????
    /*delete resjson.code;*/
    console.log("Started NEW game with code: " + b.code)
    res.send(resjson);
    db.cleanup(); // Hacemos cleanup de la BD con cada NEW
    return;
    
});

router.post('/load/:code', async (req, res) => {
    let code = req.params.code;
    console.log("Loading game with code: " + code);
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
    if (req.session.game === undefined || req.session.game === null) {
        res.send({"error": 203});
        return;
    }
    let moves = {"nodes" : req.body.moves};
    let game = req.session.game;
    let b = new Board(game, game.code);
    let resu = await b.executeMove(moves);
    if (resu != 100) {
        res.send({"error": resu});
        return;
    }
    let resjson = {
        "board": b.board,
        "score": b.score,
    };

    req.session.game = b;
    // Guardar cada 3 turnos
    if (b.movecount % 3 === 0) {
        await db.save(b.board, b.score, b.movecount, b.code);
        resjson["code"] = b.code;
    }
    res.send(resjson);
});

router.get('/check', (req, res) => {
    if (req.session.game === undefined || req.session.game === null) {
        res.send({"error": 203});
        return;
    }
    res.send(req.session.game.code);
});

router.post('/save', async (req, res) => {
    if (req.session.game === undefined || req.session.game === null) {
        res.send({"error": 203});
        return;
    }
    let game = req.session.game;
    let dbres = await db.save(game.board, game.score, game.movecount, game.code);
    if (dbres != 100) {
        res.send({"error": dbres});
        return;
    }
    res.send(game);
    return;

});



module.exports = router;