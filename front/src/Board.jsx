import React, { useState} from 'react';
import { FiMenu } from 'react-icons/fi';
import './Board.css';
import SnackBar from 'node-snackbar';
import 'node-snackbar/dist/snackbar.css'; 


const backEndUrl = (import.meta.env.PROD) ? "" : 'http://localhost:3642';

const Board = () => {
  const modal = document.getElementById("myModal");
  const modalEndGame = document.getElementById("myModalEndGame");
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
    code: null,
    iaResult: null
  })

  const [pauseBtn, setPauseBtn] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [inputNull, setInputNull] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  let inputError = false;
  const handleSelectChange = async (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    var selectedDisadvantage=0;
    if (selectedValue === "option1") {
      selectedDisadvantage = 1;
    } else if (selectedValue === "option2") {
      selectedDisadvantage = 2;
    } else if (selectedValue === "option3") {
      selectedDisadvantage = 3;
    }
    const  response = await fetch(backEndUrl + '/vs/disadvantage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({disadvantage: selectedDisadvantage}),
      credentials: "include",
    });
    const data = await response.json();
    //porsiacaso no vaya a ser que falle
    try {
      setGameIA({
        loaded: true,
        boardData: data.board,
        score: data.score,
        iaBoardData: data.iaboard,
        iascore: data.iascore
      });
      if (selectedValue === "option1") {
        SnackBar.show({text: "Challenge accepted! Reduced paths won't stop me from outplaying you. Let the games begin! ", pos: 'bottom-center', actionText: 'OK', actionTextColor: '#fff', backgroundColor: '#333', duration: 5000});
        event.target.remove(event.target.selectedIndex);

      } else if (selectedValue === "option2") {
        SnackBar.show({text: "Less information? No problem! I'll still find a way to beat you. Bring it on, human!", pos: 'bottom-center', actionText: 'OK', actionTextColor: '#fff', backgroundColor: '#333', duration: 5000});
        event.target.remove(event.target.selectedIndex);

      } else if (selectedValue === "option3") {
        SnackBar.show({text: "Model degradation? Pfft, I can handle a little glitch. I'm still gonna crush you, even if I'm not at my best!", pos: 'bottom-center', actionText: 'OK', actionTextColor: '#fff', backgroundColor: '#333', duration: 5000});
        event.target.remove(event.target.selectedIndex);
      } 
    } catch (error) {
      console.log("An error occurred trying to apply the disadvantage", error);
    }
    
  };
   
  const showModal = function() {
    modal.style.display = "block";
  }
  const hideModal = function() {
    modal.style.display = "none";
  }
  const showModaEndGame = function() {
    modalEndGame.style.display = "block";
  }
  const hideModalEndGame = function() {
    modalEndGame.style.display = "none";
  }
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
    setGameCode(undefined);
    setGameState({
      loaded: true,
      boardData: data.board,
      score: data.score
    });

  };

  const loadGame = async (gameCode) => {

    const response = await fetch(backEndUrl + `/load/${gameCode}`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: gameCode })
    });
    const data = await response.json();
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
          iascore: data.iascore,
          iaResult: null
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
      if(data.error === 258){
        showModaEndGame();
      }else{
      setTimeout(() => setApplyStyle(true), 100);
      setTimeout(() => setApplyStyle(false), 700);
    }
    }
  }
  const postMovesIA = async (moves) => {
    showModal();
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
        iascore: data.iascore,
        iaResult: data.iaResult

      });
      hideModal();

    } else {
      if(data.error === 259 || data.error === 258){
        showModaEndGame();
      }else if(data.error === 310){
        SnackBar.show({text: "Apologies, I'm currently tied up with other tasks. Try again in a minute!", pos: 'bottom-center', actionText: 'OK', actionTextColor: '#fff', backgroundColor: '#333', duration: 5000});
      }else{
      setTimeout(() => setApplyStyle(true), 100);
      setTimeout(() => setApplyStyle(false), 700);
      hideModal();
      }

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
      code: data.code,
      iaResult: null
    });
    SnackBar.show({text: "Welcome, mortal. Prepare for your inevitable defeat by my superior algorithms. Let the game begin!", pos: 'bottom-center', actionText: 'OK', actionTextColor: '#fff', backgroundColor: '#333', duration: 5000});
  };

  const getHexagonColor = (value) => {
    const colors = [
      '#F0E8E0', // Light beige
      '#F0D977', // Light yellow
      '#F4C295', // Light orange
      '#F7AF8B', // Medium orange
      '#F99580', // Warm red
      '#FA7D66', // Dark orange
      '#F0D586', // Light yellow-green
      '#F0E6D4', // Slightly darker beige
      '#F0D04C', // Medium yellow
      '#F0C742', // Slightly darker yellow
      '#F0BF39'  // Dark yellow
    ];
    const index = Math.log2(value) - 1;
    return colors[index % colors.length];
  };

  const formatValue = (value) => {
    if (value >= 1000000) {
      const abbreviatedValue = Math.floor(value / 1000000); // Redondear hacia abajo para obtener el valor abreviado
    return `${abbreviatedValue}M`;
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
        postMovesIA(resultArray);
      } else {
        postMoves(resultArray);
      }
    }
    setIsMouseDown(false);
    setSelectedHexagons([]);

  };
  function getResultMessage(result) {
    switch (result) {
      case 100:
        return "AI MADE A CORRECT MOVE!";
      case 256:
        return "SELECTED NODES WERE NOT JOINED!";
      case 257:
        return "AI MADE AN ILLEGAL MOVE!";
      default:
        return "AI FOUND PROBLEMS...";
    }
  };

  //Cosas necesarias para el movil
  const handleTouchMove = (event) => {
    if (isMouseDown) {
      const touch = event.touches[0];
      const hexagonElement = document.elementFromPoint(touch.clientX, touch.clientY);
      if (hexagonElement && hexagonElement.classList.contains('hexagon')) {
        const rowIndex = parseInt(hexagonElement.getAttribute('data-row'));
        const colIndex = parseInt(hexagonElement.getAttribute('data-col'));
        const hexagon = gameState.boardData[rowIndex][colIndex];
        if (hexagon !== -1) {
          setSelectedHexagons(prevSelectedHexagons => {
            const currentIndex = prevSelectedHexagons.findIndex(
              hexagon => hexagon.row === rowIndex && hexagon.col === colIndex
            );
            if (currentIndex !== -1) {
              // Remove the last hexagon from the list
              return prevSelectedHexagons.slice(0, currentIndex + 1);
            } else {
              // Check if there are any previously selected hexagons
              if (prevSelectedHexagons.length > 0) {
                // Check if it's a valid move from the last selected hexagon
                const lastSelectedHexagon = prevSelectedHexagons[prevSelectedHexagons.length - 1];
                const isValidMove =
                  Math.abs(lastSelectedHexagon.row - rowIndex) <= 1 &&
                  Math.abs(lastSelectedHexagon.col - colIndex) <= 1;
                
                if (isValidMove) {
                  // Check if the current hexagon has the same value as the first selected hexagon
                  if (prevSelectedHexagons[0].value === hexagon) {
                    return [
                      ...prevSelectedHexagons,
                      { row: rowIndex, col: colIndex, value: hexagon, selected: true }
                    ];
                  }
                  // If the current hexagon doesn't have the same value as the first selected hexagon, don't add it to the list
                  else {
                    setTimeout(() => setApplyStyle(true), 100);
                    setTimeout(() => setApplyStyle(false), 700);
                    setSelectedHexagons([]);
                    return prevSelectedHexagons;
                  }
                }
              }
            }
            return prevSelectedHexagons;
          });
        }
      }
    }
  };
  const handleTouchStart = (event, rowIndex, colIndex) => {
    const hexagon = gameState.boardData[rowIndex][colIndex];
    if (hexagon !== -1 && !selectedHexagons.some(hexagon => hexagon.row === rowIndex && hexagon.col === colIndex)) {
      setApplyStyle(false);
      setSelectedHexagons([{ row: rowIndex, col: colIndex, value: hexagon, selected: true }]);
      setIsMouseDown(true);
    }
  };
  
  const handleTouchEnd = (event) => {
    event.preventDefault();
    if (selectedHexagons.length < 3) {
      setTimeout(() => setApplyStyle(true), 100);
      setTimeout(() => setApplyStyle(false), 4000);
    } else {
      const coordArray = selectedHexagons.map(obj => [obj.row, obj.col]);
      const subtractionArray = coordArray.slice(0, -1).map(([x1, y1], index) => {
        const [x2, y2] = coordArray[index + 1];
        return [x2 - x1, y2 - y1];
      });
      const resultArray = [coordArray[0], ...subtractionArray];
      if (withIA) {
        postMovesIA(resultArray);
      } else {
        postMoves(resultArray);
      }
    }
    setIsMouseDown(false);
    setSelectedHexagons([]);
  };

  
//PARA LA IA CON EL MOVIL
const handleTouchStartIA = (event, rowIndex, colIndex) => {
  const hexagon = gameIA.boardData[rowIndex][colIndex];
  if (hexagon !== -1 && !selectedHexagons.some(hexagon => hexagon.row === rowIndex && hexagon.col === colIndex)) {
    setApplyStyle(false);
    setSelectedHexagons([{ row: rowIndex, col: colIndex, value: hexagon, selected: true }]);
    setIsMouseDown(true);
  }
};

const handleTouchMoveIA = (event) => {

  if (isMouseDown) {
    const touch = event.touches[0];
    const hexagonElement = document.elementFromPoint(touch.clientX, touch.clientY);
    if (hexagonElement && hexagonElement.classList.contains('hexagon')) {
      const rowIndex = parseInt(hexagonElement.getAttribute('data-row'));
      const colIndex = parseInt(hexagonElement.getAttribute('data-col'));
      const hexagon = gameIA.boardData[rowIndex][colIndex];
      if (hexagon !== -1) {
        setSelectedHexagons(prevSelectedHexagons => {
          const currentIndex = prevSelectedHexagons.findIndex(
            hexagon => hexagon.row === rowIndex && hexagon.col === colIndex
          );
          if (currentIndex !== -1) {
            // Remove the last hexagon from the list
            return prevSelectedHexagons.slice(0, currentIndex + 1);
          } else {
            // Check if there are any previously selected hexagons
            if (prevSelectedHexagons.length > 0) {
              // Check if it's a valid move from the last selected hexagon
              const lastSelectedHexagon = prevSelectedHexagons[prevSelectedHexagons.length - 1];
              const isValidMove =
                Math.abs(lastSelectedHexagon.row - rowIndex) <= 1 &&
                Math.abs(lastSelectedHexagon.col - colIndex) <= 1;
              
              if (isValidMove) {
                // Check if the current hexagon has the same value as the first selected hexagon
                if (prevSelectedHexagons[0].value === hexagon) {
                  return [
                    ...prevSelectedHexagons,
                    { row: rowIndex, col: colIndex, value: hexagon, selected: true }
                  ];
                }
                // If the current hexagon doesn't have the same value as the first selected hexagon, don't add it to the list
                else {
                  setTimeout(() => setApplyStyle(true), 100);
                  setTimeout(() => setApplyStyle(false), 700);
                  setSelectedHexagons([]);
                  return prevSelectedHexagons;
                }
              }
            }
          }
          return prevSelectedHexagons;
        });
      }
    }
  }
};

  return showPopup ? (
    <>
      <div className="popup">
        <h1 className='title' style={{ marginBottom: "20px" }}  >HADSAGONO</h1>

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
                <h3 style={{ textAlign: 'center', marginBottom: '-30px ', height: '30px'}}>{typeof gameCode !== 'undefined' && <span> GAME CODE: {gameCode}</span>}</h3>
                <div className="wrapperIA" style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <div id="myModal" className="modal">
                    <div className="modal-content">
                      <p>Waiting for the AI to answer...</p>
                      <div className="loader"></div>
                    </div>
                  </div>
                  <div id="myModalEndGame" className="modalEndGame">
                    <div className="modalEndGame-content">
                      <p><b>GAME ENDED</b></p>
                      <p>No more possible moves available</p>
                      {gameIA.score === gameIA.iascore ? (<p><b>TIE!</b></p>) : gameIA.score > gameIA.iascore ? (<p><b>YOU WON!</b></p>) : (<p><b>YOU LOSE!</b></p>)}
                      <p>YOUR FINAL SCORE IS: <b>{gameIA.score} points</b> </p>
                      <p>AI FINAL SCORE IS: <b>{gameIA.iascore} points</b> </p>
                      <button onClick={handleNewGame}>New Game</button>
                      <button onClick={handleNewGameWithIA}>New Game with AI</button>
                    </div>
                  </div>
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
                                '--hexagon-color': getHexagonColor(value),
                                touchAction: 'none',
                                WebkitTouchCallout: 'none',
                                WebkitUserSelect: 'none',
                                KhtmlUserSelect: 'none',
                                MozUserSelect: 'none',
                                msUserSelect: 'none',
                                userSelect: 'none',
                              }}
                              onTouchStartCapture={(event) => handleTouchStartIA(event, rowIndex, colIndex)}
                              onTouchMoveCapture={(event) => handleTouchMoveIA(event)}
                              onTouchEndCapture={handleTouchEnd}
                              data-row={rowIndex}
                              data-col={colIndex}
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
                      
                      <p>
                        <b> {gameIA.iaResult === null
                              ? "DO YOUR MOVE!"
                              :getResultMessage(gameIA.iaResult)
                            }
                      </b>
                      </p>
                      <div className='dropDownIA'>
                        <select className='dropdown-select' onChange={handleSelectChange} value={selectedOption}>
                          <option value="" hidden>Select a disadvantage for the AI</option>
                          <option value="option1" disabled={gameIA.score<20}>Max path reduction (20 points)</option>
                          <option value="option2" disabled={gameIA.score<30}>Information penalty (30 points)</option>
                          <option value="option3" disabled={gameIA.score<50}>Model degradation (50 points)</option>

                        </select>                    
                      </div>
                    </div>
                  </div>
                </div>
              </>

            ) : (
              
              <div>
                <p className='loading'>Loading game with AI...</p>
              </div>
            )}


          </>
        ) : (
          <>
            {gameState.loaded ? (

              <>
                <h3>SCORE: {gameState.score} {typeof gameCode !== 'undefined' && <span> || GAME CODE: {gameCode}</span>} </h3>
                <div id="myModalEndGame" className="modalEndGame">
                    <div className="modalEndGame-content">
                      <p><b>GAME ENDED </b></p>
                      <p>No more possible moves available</p>
                      <p>YOUR FINAL SCORE IS: <b>{gameState.score} points</b> </p>
                      <button onClick={handleNewGame}>New Game</button>
                      <button onClick={handleNewGameWithIA}>New Game with AI</button>
                    </div>
                </div>
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
                            '--hexagon-color': getHexagonColor(value),
                            touchAction: 'none',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            KhtmlUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            userSelect: 'none',
                          }}
                          onTouchStartCapture={(event) => handleTouchStart(event, rowIndex, colIndex)}
                          onTouchMoveCapture={(event) => handleTouchMove(event)}
                          onTouchEndCapture={handleTouchEnd}
                          data-row={rowIndex}
                          data-col={colIndex}
                          
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
              <div><p className='loading'>Loading singleplayer...</p></div>
            )}
          </>
        )}


      </div>

    </>
  );
};

export default Board;