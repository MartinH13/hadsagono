require('dotenv').config();
const mongoose = require('mongoose');
const { Schema } = mongoose;

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const boardSchema = new Schema({
  board: [],
  score: Number,
  movecount: Number,
  date: { type: Date, default: Date.now },
  code: String,
});

const Board = mongoose.model('Board', boardSchema);

class DataAccess {
  static async save(board, score, movecount, code) {
    try {
      // Check if the code exists in the db
      console.log("Checking if code exists: " + code);
      const codeExists = await DataAccess.codeExists(code);
      console.log("Code exists: " + codeExists);

      if (codeExists) {
        // If the code exists, update the document
        await Board.updateOne(
          { code: code },
          { $set: { board: board, score: score, movecount: movecount } }
        );
        console.log("Updated board with code: " + code);
      } else {
        // If the code doesn't exist, insert a new document
        await Board.create({ board, score, movecount, code });
        console.log("Inserted board with code: " + code);
      }
      return 100;
    } catch (error) {
      console.error('Error:', error);
      return 283;
    }
  }

  static async load(code) {
    // Check if the code exists in the db
    console.log("Load in dataAccess");
    if (!(await DataAccess.codeExists(code))) return 281;

    // If it exists, return the board and score
    return Board.findOne({ code: code });
  }

  static async generateCode() {
    try {
      console.log("New code");
      const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
      const data = await response.json();
      console.log("Generated code:" + data);
      return data[0];
    } catch (error) {
      console.error('Error:', error);
      return 282;
    }
  }

  // Not for use outside of this class
  static async codeExists(code) {
    try {
      return await Board.exists({ code: code });
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}

module.exports = DataAccess;