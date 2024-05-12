import React, { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import './Board.css';

const backEndUrl = (import.meta.env.PROD) ? "" : 'http://localhost:3642';

const Board = () => {

  const [selectedHexagons, setSelectedHexagons] = useState([]);
  const [gameCode, setGameCode] = useState(undefined);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [applyStyle, setApplyStyle] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [withIA, setWithIA] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [gameState, setGameState] = useState({
    loaded: false,
    boardData: null,
    score: 0,
    code: null
  });
  const [gameIA, setGameIA] = useState({
    loaded: false,
    boardData: null,
    score: 0,
    iaBoardData: null,
    iascore: 0,
    code: null
  });

  const [pauseBtn, setPauseBtn] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [inputNull, setInputNull] = useState(false);
  let inputError = false;

  const handlePause = () => {
    if (pauseBtn) {
      setPauseBtn(false);
      setShowPopup(false);
      setShowInput(false);
    } else {
      setShowPopup(true);
      setPauseBtn(true);
      setShowInput(false);
    }

  }
  const handleNewGame = () => {
    startGame();
    setWithIA(false);
    setInputNull(false);
    inputError = false;
    setShowPopup(false);
  };

  const handleLoadGame = () => {
    setShowInput(true);
  };
  const handleNewGameWithIA = () => {
    setWithIA(true);
    startGameWithIA();
    setInputNull(false);
    inputError = false;
    setShowPopup(false);
  }
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleLoad = async () => {
    if (inputValue.length === 0) {
      setInputNull(true);
      setShowPopup(true);
    } else {
      await loadGame(inputValue);
      if (inputError == false) {
        console.log("no hay error");
        setInputNull(false);
        setShowPopup(false);

      } else {
        setInputNull(true);
        setShowPopup(true);
      }
    }
  };



  const startGame = async () => {
    setGameState({
      loaded: false
    });
    const response = await fetch(backEndUrl + '/single/new', {
      method: 'GET',
      credentials: "include",
    });
    const data = await response.json();
    console.log("CODIGO", data.code);
    setGameCode(undefined);
    setGameState({
      loaded: true,
      boardData: data.board,
      score: data.score
    });

  };

  const loadGame = async (gameCode) => {

    console.log("GameCode", gameCode);
    const response = await fetch(backEndUrl + `/load/${gameCode}`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: gameCode })
    });
    const data = await response.json();
    console.log("DATA", data);
    if (data.error !== 281 && data.error !== 282) {
      if (data.iaboard === undefined) {
        setWithIA(false);
        setGameCode(data.code);
        setGameState({
          loaded: true,
          boardData: data.board,
          score: data.score
        });
      } else {
        setWithIA(true);
        setGameCode(data.code);
        setGameIA({
          loaded: true,
          boardData: data.board,
          score: data.score,
          iaBoardData: data.iaboard,
          iascore: data.iascore
        });
      }
      inputError = false;
    } else {
      inputError = true;
    }

  };

  const postMoves = async (moves) => {
    const response = await fetch(backEndUrl + '/single/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ moves }),
      credentials: "include",
    });
    const data = await response.json();

    if (typeof data.error === 'undefined') {
      // if data contains a code
      if (data.code !== undefined) {
        setGameCode(data.code);
      }

      setGameState({
        loaded: true,
        boardData: data.board,
        score: data.score,
      });
    } else {
      setTimeout(() => setApplyStyle(true), 100);
      setTimeout(() => setApplyStyle(false), 700);

    }
  }
  const postMovesIA = async (moves) => {
    const response = await fetch(backEndUrl + '/vs/move', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ moves }),
      credentials: "include",
    });
    const data = await response.json();

    if (typeof data.error === 'undefined') {
      // if data contains a code
      if (data.code !== undefined) {
        setGameCode(data.code);
      }
      setGameIA({
        loaded: true,
        boardData: data.board,
        score: data.score,
        iaBoardData: data.iaboard,
        iascore: data.iascore

      });

    } else {
      setTimeout(() => setApplyStyle(true), 100);
      setTimeout(() => setApplyStyle(false), 700);

    }

  }

  const startGameWithIA = async () => {
    setGameIA({
      loaded: false
    });
    const response = await fetch(backEndUrl + '/vs/new', {
      method: 'GET',
      credentials: "include",
    });
    const data = await response.json();
    setGameCode(undefined);
    setGameIA({
      loaded: true,
      boardData: data.board,
      score: data.score,
      iaBoardData: data.iaboard,
      iascore: data.iascore,
      code: data.code
    });


  };


  const getHexagonColor = (value) => {
    const colors = [
      '#EEE4DA', '#EDCC61', '#F2B179', '#F59563',
      '#F67C5F', '#F65E3B', '#EDCF72', '#EDE0C8',
      '#EDC850', '#EDC53F', '#EDC22E'
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
  const handleMouseDownIA = (rowIndex, colIndex) => {
    const hexagon = gameIA.boardData[rowIndex][colIndex];
    if (hexagon !== -1 && !selectedHexagons.some(hexagon => hexagon.row === rowIndex && hexagon.col === colIndex)) {
      setApplyStyle(false);
      setSelectedHexagons([{ row: rowIndex, col: colIndex, value: hexagon, selected: true }]);
      setIsMouseDown(true);
    }
  };
  const handleMouseEnterIA = (rowIndex, colIndex) => {
    if (isMouseDown) {
      const hexagon = gameIA.boardData[rowIndex][colIndex];
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
    if (selectedHexagons.length < 3) {
      setTimeout(() => setApplyStyle(true), 100);
      setTimeout(() => setApplyStyle(false), 4000);

    }
    else {
      const coordArray = selectedHexagons.map(obj => [obj.row, obj.col]);
      const subtractionArray = coordArray.slice(0, -1).map(([x1, y1], index) => {
        const [x2, y2] = coordArray[index + 1];
        return [x2 - x1, y2 - y1];
      });
      const resultArray = [coordArray[0], ...subtractionArray];
      if (withIA) {
        console.log("With IA");
        postMovesIA(resultArray);
      } else {
        postMoves(resultArray);
      }
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
            {pauseBtn ? (

              <button onClick={handlePause}> Continue</button>
            ) : (null)}
            <button onClick={handleNewGame}> Start New Game</button>
            <button onClick={handleNewGameWithIA} style={{ marginBottom: "20px" }}> Start Game With IA</button>
            {inputNull ? <p style={{ color: "red", marginTop: "-10px", marginBottom: "8px" }}><b>Please enter a valid game code</b></p> : null}
            <input type="text" placeholder="Enter your game code" value={inputValue} onChange={handleInputChange} />
            <button onClick={handleLoad}>Load </button>
          </>
        ) : (
          <>
            {pauseBtn ? (
              <>
                <button onClick={handlePause}> Continue</button>
                <button onClick={handleNewGame}> Start New Game</button>
                <button onClick={handleNewGameWithIA}> Start Game With IA</button>
                <button onClick={handleLoadGame}>Load Game</button>
              </>
            ) : (
              <>
                <button onClick={handleNewGame}> Start New Game</button>
                <button onClick={handleNewGameWithIA}> Start Game With IA</button>
                <button onClick={handleLoadGame}>Load Game</button>
              </>
            )}

          </>
        )}
        <div className='credits'>
          <p><b>Authors:</b></p>
          <p>Nicolás Aguado</p>
          <p>Asier Contreras</p>
          <p>Martin Horsfield</p>

        </div>
      </div>

    </>
  ) : (
    <>
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <FiMenu size={30} onClick={handlePause} />
      </div>
      <div className="board" >
        <h1 className='title' >HADSAGONO</h1>


        {withIA ? (

          <>
            {gameIA.loaded ? (
              <>
                <h3 style={{ textAlign: 'center', marginBottom: '-30px ' }}>{typeof gameCode !== 'undefined' && <span> GAME CODE: {gameCode}</span>}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>



                  <div className='containerWithNoIA' style={{ marginRight: '10px' }}>
                    <h3>SCORE: {gameIA.score} </h3>
                    <div className={`container ${applyStyle ? 'shake' : ''}`} style={applyStyle ? { backgroundColor: '#DE7676' } : {}}>

                      {gameIA.boardData.map((row, rowIndex) => (

                        <div key={rowIndex} className="board-row" >
                          {row.map((value, colIndex) => (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`hexagon ${value === -1 ? 'empty' : ''} ${colIndex % 2 === 1 ? 'odd-col' : ''
                                } ${selectedHexagons.some(hexagon => hexagon.row === rowIndex && hexagon.col === colIndex) ? 'selected' : ''}`}
                              style={{
                                backgroundColor: getHexagonColor(value),
                                '--hexagon-color': getHexagonColor(value)
                              }}
                              onMouseDown={() => handleMouseDownIA(rowIndex, colIndex)}
                              onMouseEnter={() => handleMouseEnterIA(rowIndex, colIndex)}
                              onMouseUp={handleMouseUp}
                            >
                              {value !== -1 && value !== null && <span className="text">{formatValue(value)}</span>}
                            </div>
                          ))}
                        </div>

                      ))}
                    </div>
                  </div>

                  <div className='containerIA' style={{ marginLeft: '10px' }}>
                    <h3>IA SCORE: {gameIA.iascore} </h3>
                    <div className="container" style={{ pointerEvents: 'none', scale: '0.8', marginTop: '-50px' }} >

                      {gameIA.iaBoardData.map((row, rowIndex) => (

                        <div key={rowIndex} className="board-row" >
                          {row.map((value, colIndex) => (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={`hexagon ${value === -1 ? 'empty' : ''} ${colIndex % 2 === 1 ? 'odd-col' : ''
                                } `}
                              style={{
                                backgroundColor: getHexagonColor(value),
                                '--hexagon-color': getHexagonColor(value)
                              }}

                              onMouseUp={handleMouseUp}
                            >
                              {value !== -1 && value !== null && <span className="text">{formatValue(value)}</span>}
                            </div>
                          ))}
                        </div>

                      ))}
                    </div>
                    <div style={{ marginTop: '-50px' }}>
                      <p><b>HOLA MENSAJE DE PRUEBA</b></p>
                    </div>
                  </div>
                </div>
              </>

            ) : (
              <div>Loading game with IA...</div>
            )}


          </>
        ) : (
          <>
            {gameState.loaded ? (

              <>
                <h3>SCORE: {gameState.score} {typeof gameCode !== 'undefined' && <span> || GAME CODE: {gameCode}</span>} </h3>

                <div className={`container ${applyStyle ? 'shake' : ''}`} style={applyStyle ? { backgroundColor: '#DE7676' } : {}}>

                  {gameState.boardData.map((row, rowIndex) => (

                    <div key={rowIndex} className="board-row" >
                      {row.map((value, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`hexagon ${value === -1 ? 'empty' : ''} ${colIndex % 2 === 1 ? 'odd-col' : ''
                            } ${selectedHexagons.some(hexagon => hexagon.row === rowIndex && hexagon.col === colIndex) ? 'selected' : ''}`}
                          style={{
                            backgroundColor: getHexagonColor(value),
                            '--hexagon-color': getHexagonColor(value)
                          }}
                          onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                          onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                          onMouseUp={handleMouseUp}
                        >
                          {value !== -1 && value !== null && <span className="text">{formatValue(value)}</span>}
                        </div>
                      ))}
                    </div>

                  ))}
                </div>
              </>

            ) : (
              <div>Loading singleplayer...</div>
            )}
          </>
        )}


      </div>

    </>
  );
};

export default Board;