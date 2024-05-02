import React, { useState,useEffect } from 'react';
import './Board.css';

const Board = () => {

  const [selectedHexagons, setSelectedHexagons] = useState([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [applyStyle, setApplyStyle] = useState(false);


  const [gameLoaded, setGameLoaded] = useState(false);


  const [gameState, setGameState] = useState({
    loaded: false,
    boardData: null,
    score: 0,
  });
  
let startGameCalled = false;

  const startGame = async () => {
    const response = await fetch('http://localhost:3642/single/new');
    const data = await response.json();
    //Tengo que hacer esta guarrada de if porque si se actualiza dos veces ni idea la verdad
   if(!startGameCalled){
    setGameState({
      loaded: true,
      boardData: data.board,
      score: data.score,
    });
    startGameCalled = true;
  }
  };
  
  useEffect(() => {
    startGame();
    console.log("El juego ha comenzado");
  }, []);


  
 

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
              //DO SOME CSS CHANGE HERE
              
              setTimeout(() => setApplyStyle(true), 100);
              setTimeout(() => setApplyStyle(false), 700); // Reset applyStyle after 1 second

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
      setTimeout(() => setApplyStyle(true), 100); // Start shaking after 1 second
      setTimeout(() => setApplyStyle(false), 700); // Reset applyStyle after 1 second
      setSelectedHexagons([]);
    
    }
    else{
      //Call backend with API. POST to localhost:3642/single/move with array of selectedHexagons
      console.log(selectedHexagons);
      const coordArray = selectedHexagons.map(obj => [obj.row, obj.col]);
      console.log(coordArray);
      const subtractionArray = coordArray.slice(0, -1).map(([x1, y1], index) => {
        console.log(index);
        const [x2, y2] = coordArray[index + 1];
        return [x2 - x1, y2 - y1];
      });
      const resultArray = [coordArray[0], ...subtractionArray];
      console.log(resultArray);
      postMoves(resultArray);
    }
    setIsMouseDown(false);
  };

  const postMoves = async (moves) => {
    const response = await fetch('http://localhost:3642/single/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ moves })
    });
    const data = await response.json();
    console.log(data);
  }
  
 

  return (
   
    <div className="board" >
      <h1 className='title' >HADSAGONO</h1>
      {gameState.loaded ? (
        <>
      <h3>SCORE: {gameState.score}</h3>
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
      <div className="selected-hexagons">
        <h3>Selected Hexagons:</h3>
        <ul>
          {selectedHexagons.map((hexagon, index) => (
            <li key={index}>
              Row: {hexagon.row}, Col: {hexagon.col}, Value: {formatValue(hexagon.value)}
            </li>
          ))}
        </ul>
      </div>
      </>
      ) : (
        <div>Cargando el juego...</div>
      )}
    </div>
  );
};

export default Board;