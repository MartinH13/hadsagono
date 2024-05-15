require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const boardSchema = new Schema({
  board: [],
  score: Number,
  movecount: Number,
  code: String,
  date: { type: Date, default: Date.now }
});

const boardAISchema = new Schema({
  board: [],
  score: Number,
  movecount: Number,
  code: String,
  ai: {type: Boolean, default: false},
  aiBoard: [{type: [], default: []}],
  aiScore : {type: Number, default: 0},
  consumedDisadvantages : [{type: [], default: []}],
  date: { type: Date, default: Date.now }
});

const Board = mongoose.model('Board', boardSchema);
const BoardAI = mongoose.model('BoardAI', boardAISchema);
const BackupBoard = mongoose.model('BackupBoard', boardSchema);
const BackupBoardAI = mongoose.model('BackupBoard', boardSchema);

class DataAccess {

  static async save(board, score, movecount, code) {
    try {
      // Check if the code exists in the db
      const codeExists = await DataAccess.codeExists(code);

      if (codeExists == 1) {
        // If the code exists, update the document
        await Board.updateOne(
          { code: code },
          { $set: { board: board, score: score, movecount: movecount} }
        );
      } else if (codeExists == 0){
        // If the code doesn't exist, insert a new document
        await Board.create({ board, score, movecount, code});
      }
      return 100;
    } catch (error) {
      console.error('Error:', error);
      return 283;
    }
  }

  static async saveAI(board, score, movecount, code, ai, aiBoard, aiScore, consumedDisadvantages) {
    try {
      // Check if the code exists in the db
      const codeExists = await DataAccess.codeExists(code);

      if (codeExists == 2) {
        // If the code exists, update the document
        await Board.updateOne(
          { code: code },
          { $set: { board: board, score: score, movecount: movecount, ai: ai, aiBoard: aiBoard, aiScore: aiScore, consumedDisadvantages : consumedDisadvantages } }
        );
      } else if (codeExists == 0) {
        // If the code doesn't exist, insert a new document
        await BoardAI.create({ board, score, movecount, code, ai, aiBoard, aiScore });
      }
      return 100;
    } catch (error) {
      console.error('Error:', error);
      return 283;
    }
  }

  static async load(code) {
    // Check if the code exists in the db
    try {
      let codeExists = await DataAccess.codeExists(code);
      switch (codeExists) {
        case 0:
          return 281;
        case 10:
          return 284;
        case 1:
          return await Board.findOne({ code: code });
        case 2:
          return await BoardAI.findOne({ code: code });
        default:
          return 777;
      } 
    } catch (error) {
      console.error('Error:', error);
      return 777;
    }
  }

  static async generateCode() {
    try {
      const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
      const data = await response.json();
      const returnedCode = await this.codeExists(data[0]);
      if (returnedCode!=0) {
        return DataAccess.generateCode();
      }
      return data[0];
    } catch (error) {
      console.error('Error:', error);
      return 282;
    }
  }

  // Not for use outside of this class
  static async codeExists(code) {
    try {
      const existsBoard = await Board.exists({ code: code });
      const existsBoardAI = await BoardAI.exists({ code: code });
      if (existsBoard && existsBoardAI) {
        DataAccess.purgeCode(code);
        return 10;
      } else if (existsBoard) {
        return 1;
      }
      else if (existsBoardAI) {
        return 2;
      }
      return 0;
      
    } catch (error) {
      console.error('Error:', error);
      return 777;
    }
  }

  //Cleanup function. Deletes documents older than 3 months or if there's less than 3 moves
  static async cleanup() {
    try {
      const threeMonthsAgo = moment().subtract(3, 'months').toDate();

      let result = await Board.deleteMany({
        $or: [
          { date: { $lt: threeMonthsAgo  } },
          { movecount: { $lt: 3 } }
        ]
      });
      result = await BoardAI.deleteMany({
        $or: [
          { date: { $lt: threeMonthsAgo  } },
          { movecount: { $lt: 3 } }
        ]
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //Backup function. Backs up all documents to a new collection
  static async backup() {
    try {
      const result = await Board.find();
      await BackupBoard.insertMany(result);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //Restore function. Restores all documents from the backup collection
  static async restore(overwrite = false) {
    try {
      const result = await BackupBoard.find();
      if (overwrite)
        await Board.deleteMany();
      await Board.insertMany(result);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  static async purgeCode(code) {
    try {
      await Board.deleteMany({ code: code});
      await BoardAI.deleteMany({ code: code});
    } catch (error) {
      console.error('Error:', error);
    }
  }

}

module.exports = DataAccess;