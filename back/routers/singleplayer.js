let express = require('express');
let router = express.Router();
let Board = require('../logic/board.js');
let db = require('../logic/dataAccess.js');
let utils = require('../logic/utils.js');

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
    let clone = JSON.parse(JSON.stringify(resjson));
    // En la primera jugada no se manda el codigo
    delete clone.code;
    res.send(clone);
    db.cleanup(); // Hacemos cleanup de la BD con cada NEW
    return;
    
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
        "score": b.score
    };

    let playerMove1 = utils.findSolutions(b.board, b.possibleMoves, 3);
    if (!playerMove1) {
        console.log("No hay movimientos Player");
        res.send({"error": 258});
        return;
    }

    req.session.game = b;
    // Guardar cada 3 turnos
    if (b.movecount % 3 == 0) {
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

router.get("/", (req, res) => {
    res.send("200 SINGLEPLAYER BACKEND OK");
});


module.exports = router;