import React, { useState,useEffect } from 'react';
import './Board.css';

const Board = () => {

  const [selectedHexagons, setSelectedHexagons] = useState([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [applyStyle, setApplyStyle] = useState(false);
  const [showInput, setShowInput] = useState(false); 
  const [inputValue, setInputValue] = useState('');
  const [gameState, setGameState] = useState({
    loaded: false,
    boardData: null,
    score: 0,
    code: null
  });
  const [showPopup, setShowPopup] = useState(true); 
  const [inputNull, setInputNull] = useState(false); 
  let inputError = false;

  const handleNewGame = () => {
      startGame();  
      setInputNull(false);
      inputError = false;
      setShowPopup(false); 
  };

  const handleLoadGame = () => {
      setShowInput(true); 
  };
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleLoad = async () => {
    if (inputValue.length === 0) {
      setInputNull(true);
      setShowPopup(true);
    } else {
      await loadGame(inputValue);
      if(inputError == false){
        setInputNull(false);
        setShowPopup(false);
      }else{
        setInputNull(true);
        setShowPopup(true);
      }
    }
  };
  
  

  const startGame = async () => {
    const response = await fetch('http://localhost:3642/single/new', {
      method: 'GET',
      credentials: "include",
    });
    const data = await response.json();
    console.log("CODIGO",  data.code );

    setGameState({
      loaded: true,
      boardData: data.board,
      score: data.score,
      code: data.code
    });
  
  };
  
  const loadGame = async (gameCode) => {
    console.log("GameCode", gameCode);
    const response = await fetch(`http://localhost:3642/single/load/${gameCode}`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: gameCode })
    });
    
    const data = await response.json();

    if ( data.error !== 281 && data.error !== 282)  {
      setGameState({
          loaded: true,
          boardData: data.board,
          score: data.score,
          code: data.code

        });
        inputError = false;
       }else{
       inputError = true;
    }

  };
 
  const postMoves = async (moves) => {
    const response = await fetch('http://localhost:3642/single/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ moves }),
      credentials: "include",
    });
    const data = await response.json();

    if (typeof data.error === 'undefined')  {
      setGameState({
      loaded: true,
      boardData: data.board,
      score:  data.score,
      code: gameState.code
    });
    
  }else{
    setTimeout(() => setApplyStyle(true), 100); 
    setTimeout(() => setApplyStyle(false), 700);

  }
    //[INSERTAR DESELECCION AQUI]
  }
  const getHexagonColor = (value) => {
    const colors = [
      '#EEE4DA', '#EDE0C8', '#F2B179', '#F59563',
      '#F67C5F', '#F65E3B', '#EDCF72', '#EDCC61',
      '#EDC850', '#EDC53F', '#EDC22E', '#3C3A32'
    ];
    const index = Math.log2(value) - 1;
    return colors[index % colors.length];
  };

  const formatValue = (value) => {
    if (value >= 1000000) {
      return '1M';
    } else if (value >= 1000) {
      const abbreviatedValue = Math.floor(value / 1000); // Redondear hacia abajo para obtener el valor abreviado
      return `${abbreviatedValue}K`;
    } else {
      return value.toString();
    }
  };

  const handleMouseDown = (rowIndex, colIndex) => {
    const hexagon = gameState.boardData[rowIndex][colIndex];
    if (hexagon !== -1 && !selectedHexagons.some(hexagon => hexagon.row === rowIndex && hexagon.col === colIndex)) {
      setApplyStyle(false);
      setSelectedHexagons([{ row: rowIndex, col: colIndex, value: hexagon, selected: true }]);
      setIsMouseDown(true);
    }
  };
  const handleMouseEnter = (rowIndex, colIndex) => {
    if (isMouseDown) {
      const hexagon = gameState.boardData[rowIndex][colIndex];
      if (hexagon !== -1) {
        setSelectedHexagons(prevSelectedHexagons => {
          const currentIndex = prevSelectedHexagons.findIndex(
            hexagon => hexagon.row === rowIndex && hexagon.col === colIndex
          );
          if (currentIndex !== -1) {
            // Remove the last hexagon from the list
            return prevSelectedHexagons.slice(0, prevSelectedHexagons.length - 1);
          } else {
            // Check if it's the first selected hexagon
            if (prevSelectedHexagons.length === 0) {
              return [
                ...prevSelectedHexagons,
                { row: rowIndex, col: colIndex, value: hexagon, selected: true }
              ];
            }
            // Check if the previous hexagon has the same value as the first selected hexagon
            else if (
              prevSelectedHexagons.length > 0 &&
              prevSelectedHexagons[0].value === hexagon
            ) {
              return [
                ...prevSelectedHexagons,
                { row: rowIndex, col: colIndex, value: hexagon, selected: true }
              ];
            }
            // If the previous hexagon doesn't have the same value as the first selected hexagon, don't add it to the list
            else {
              
              setTimeout(() => setApplyStyle(true), 100);
              setTimeout(() => setApplyStyle(false), 700); 

              setSelectedHexagons([]);
              return prevSelectedHexagons;
              
            }
          }
        });
      }
    }
  };

  const handleMouseUp = () => {
    if(selectedHexagons.length <3){
      setTimeout(() => setApplyStyle(true), 100); 
      setTimeout(() => setApplyStyle(false), 4000); 

    }
    else{
      const coordArray = selectedHexagons.map(obj => [obj.row, obj.col]);
      const subtractionArray = coordArray.slice(0, -1).map(([x1, y1], index) => {
        const [x2, y2] = coordArray[index + 1];
        return [x2 - x1, y2 - y1];
      });
      const resultArray = [coordArray[0], ...subtractionArray];
      postMoves(resultArray);
    }
    setIsMouseDown(false);
    setSelectedHexagons([]);

  };
  return showPopup ? (
    <>
    <div className="popup">
            <h1 className='title' >HADSAGONO</h1>

        {showInput ? (
          <>
                <button onClick={handleNewGame}  style={{ marginBottom: "20px" }} > Start New Game</button>
                {inputNull ? <p style={{color: "red", marginTop: "-10px", marginBottom: "8px"}}><b>Please enter a valid game code</b></p> : null}
                <input type="text" placeholder="Enter your game code" value={inputValue} onChange={handleInputChange}/>
                <button onClick={handleLoad}>Load </button>
                </>
            ) : (
              <>
              <button onClick={handleNewGame}> Start New Game</button>
              <button onClick={handleLoadGame}>Load Game</button>
                </>
            )}
          <div className='credits'>
          <p><b>Authors:</b></p>
          <p>Nicolas Aguado</p>
          <p>Asier Contreras</p>
          <p>Martin Horsfield</p> 

    </div>
    </div>
   
    </>
) : (

    <div className="board" >
      <h1 className='title' >HADSAGONO</h1>
      {gameState.loaded ? (
        <>
      <h3>SCORE: {gameState.score} || GAME CODE: {gameState.code} </h3>
      <div className={`container ${applyStyle ? 'shake' : ''}`} style={applyStyle ? { backgroundColor : '#DE7676' } : {}}>
        
      {gameState.boardData.map((row, rowIndex) => (
        
        <div key={rowIndex} className="board-row" >
          {row.map((value, colIndex) => (
            <div
            key={`${rowIndex}-${colIndex}`}
            className={`hexagon ${value === -1 ? 'empty' : ''} ${
              colIndex % 2 === 1 ? 'odd-col' : ''
            } ${selectedHexagons.some(hexagon => hexagon.row === rowIndex && hexagon.col === colIndex) ? 'selected' : ''}`}
            style={{
              backgroundColor: getHexagonColor(value),
              '--hexagon-color': getHexagonColor(value)
            }}
            onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
            onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
            onMouseUp={handleMouseUp}
          >
            {value !== -1 && <span className="text">{formatValue(value)}</span>}
          </div>
          ))}
        </div>
        
      ))}
      </div>
     
      </>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default Board;