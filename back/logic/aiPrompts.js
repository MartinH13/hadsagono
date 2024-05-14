class Prompts {
    static generateBasePrompt() {
        return `
        You are playing a connecting numbers game. The numbers are represented in a matrix.
        You have to connect a minimum of 3 numbers of the same value.
        You are restricted to only some possible movements along the matrix. I will pass on an array of possible movements like this: "i,j" : [[a,b], [c,d]], ... where i is the row of the matrix and j is the column of the matrix. From i,j you can move in the directions displayed by [a,b] or where a is the difference in the "rows" (i variable) and b is the difference in the columns (j variable)  
        You must connect the most amount of numbers.
        Now, please choose one of the possible plays I will pass you and return the number that you selected. Only respond with the number of the play you want to make. Do not explicitly include the play number. The response must be 1 digit long. Do not be verbose. Do not provide any explanations.
        `;
    }

    static generateMovementsPrompt(matrix, possibleMoves, movements, disadvantages) {
        if (!disadvantages.includes(2)){
            let resprompt = `This is the matrix:
            ${matrix}
            The array of possible movements is this:
            ${possibleMoves}
            
            `;
            resprompt+= "Possible Plays you have to choose: \n";
            for (let i = 0; i < movements.length; i++) {
                resprompt += `${i}: ${movements[i]}\n`;
            }
            return resprompt;
        }
        else{
            let resprompt = `
            You are playing with a disadvantage where you won't be able to see some of the information about the possible plays.
            This is the matrix:
            ${matrix.slice(0, 3).map(row => row.slice(0, 3))}
            The array of possible movements is this:
            ${possibleMoves}
            
            `;
            resprompt+= "Possible Plays you have to choose: \n";
            for (let i = 0; i < movements.length; i++) {
                resprompt += `${i}: ${movements[i]}\n`;
            }
            resprompt += "Possible Plays you have to choose: \n";
            return resprompt;
        }
    }
}

module.exports = Prompts;