let express = require('express');
let router = express.Router();
let Board = require('../logic/board.js');
let db = require('../logic/dataAccess.js');
let utils = require('../logic/utils.js');


router.post('/:code', async (req, res) => {
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
            case 284:
                res.send({"error": 284});
                break;
        }
        return;
    }

    // good, now we can load the game
    let resjson = {};
    // check if board is normal or ai
    if (game.ai) {
        let b = new Board({"board" : game.board, "score": game.score, "movecount": game.movecount} ,code);
        let bia = new Board({"board" : game.aiBoard, "score": game.aiScore, "movecount": game.movecount} ,code);
        resjson = {
            "board": b.board,
            "iaboard": bia.board,
            "score": b.score,
            "iascore": bia.score,
            "movecount" : game.movecount,
            "possibleMoves": b.possibleMoves,
            "consumedDisadvantages": game.consumedDisadvantages,
            "code": code
        };
        // implement disadvantages
        if (game.consumedDisadvantages.includes(1)) {
            resjson["iaPathGeneration"] = 5;
        }

        req.session.game = resjson;
    } else {
        // everything good, load game
        let b = new Board({"board" : game.board, "score": game.score, "movecount": game.movecount} ,code);
        resjson = {
            "board": game.board,
            "score": game.score,
            "movecount" : game.movecount,
            "possibleMoves": b.possibleMoves,
            "code": b.code
        };
        req.session.game = resjson;
    }
    res.send(resjson);
});


module.exports = router;