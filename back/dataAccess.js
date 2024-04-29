//import env
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;
const db = mongojs(mongoURI, ['boards']);

class DataAccess{

    static save(board, score, movecount, code){
        //Check if the code exists in the db
        if(DataAccess.codeExists(code))
            db.boards.update({ "code": code }, { "board": board, "score": score, "movecount": movecount });

        return 100;
    }

    static load(code){
        //Check if the code exists in the db
        if(!DataAccess.codeExists(code))
            return 281;

        //If it exists, return the board and score
        return db.boards.findOne({ code: code })[1];
    }

    static generateCode(){
        fetch('https://random-word-api.herokuapp.com/word?length=5')
            .then(response => response.json())
            .then(data => {
                console.log("Generated code:" + data);
            })
            .catch(error => {
                // Handle any errors
                console.error('Error:', error);
                return 282;
            });
        
        //Recursive call if the code already exists
        if (this.codeExists(data))
            return DataAccess.generateCode();
        else
            return data;
    }

    //Not for use outside of this class
    static codeExists(code){
        //Check if the code exists in the db
        return db.boards.findOne({ code: code }) !== null;
    }

}

module.exports = DataAccess;