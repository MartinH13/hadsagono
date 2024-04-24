import React, { useState } from 'react';
import './Board.css';

const Board = () => {
  const boardData = {
    "board": [
      [1024, 2, 16, 2, 16],
      [8, 2, 2, 2, 8],
      [8, 4, 16, 4, 8],
      [4, 16, 4, 16, 4],
      [4, 4, 4, 4, 4],
      [16, -1, 8, -1, 16]
    ]
  };

  const [selectedHexagons, setSelectedHexagons] = useState([]);
  const [isMouseDown, setIsMouseDown] = useState(false);

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
    const hexagon = boardData.board[rowIndex][colIndex];
    if (hexagon !== -1) {
      setSelectedHexagons([{ row: rowIndex, col: colIndex, value: hexagon }]);
      setIsMouseDown(true);
    }
  };

  const handleMouseEnter = (rowIndex, colIndex) => {
    if (isMouseDown) {
      const hexagon = boardData.board[rowIndex][colIndex];
      if (hexagon !== -1) {
        setSelectedHexagons(prevSelectedHexagons => [
          ...prevSelectedHexagons,
          { row: rowIndex, col: colIndex, value: hexagon }
        ]);
      }
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
   
    <div className="board" onMouseLeave={handleMouseUp}>
      <h1 className='title' >HADSAGONO</h1>
      {boardData.board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((value, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`hexagon ${value === -1 ? 'empty' : ''} ${
                colIndex % 2 === 1 ? 'odd-col' : ''
              }`}
              style={{ backgroundColor: getHexagonColor(value),
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
    </div>
  );
};

export default Board;