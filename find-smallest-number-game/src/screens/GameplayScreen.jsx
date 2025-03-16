import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../styles/GameplayScreen.module.css';

const GameplayScreen = () => {
  const { type, mode } = useParams(); // type: 'grid' or 'free', mode: 'campaign', 'custom', or 'zen'
  console.log(`Gameplay Screen Loading - Type: ${type}, Mode: ${mode}`); // Debug log
  const navigate = useNavigate();
  
  // Game state
  const [isPaused, setIsPaused] = useState(false);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [lives, setLives] = useState(3); // For zen mode
  
  // Grid state (for grid mode)
  const [gridSize, setGridSize] = useState(5);
  const [gridNumbers, setGridNumbers] = useState([]);
  
  // Free mode state
  const [freeNumbers, setFreeNumbers] = useState([]);
  
  // Load game settings from localStorage or use defaults
  useEffect(() => {
    const loadSettings = () => {
      try {
        // This is just placeholder code - in a real implementation, 
        // you'd load actual settings from localStorage
        if (type === 'grid') {
          // Create a grid of random numbers
          const grid = Array(gridSize * gridSize).fill(0).map(() => 
            Math.floor(Math.random() * 20) + 1
          );
          setGridNumbers(grid);
        } else {
          // Create random numbers for free mode
          const numbers = Array(20).fill(0).map(() => ({
            value: Math.floor(Math.random() * 20) + 1,
            x: Math.random() * 80 + 10, // percentage position
            y: Math.random() * 70 + 15  // percentage position
          }));
          setFreeNumbers(numbers);
        }
      } catch (error) {
        console.error("Error loading game settings:", error);
      }
    };
    
    loadSettings();
  }, [type, gridSize]);
  
  const handlePauseClick = () => {
    setIsPaused(!isPaused);
  };
  
  const renderGridMode = () => {
    return (
      <div className={styles.gridContainer}>
        <div 
          className={styles.grid}
          style={{ 
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`
          }}
        >
          {gridNumbers.map((number, index) => (
            <div 
              key={index}
              className={styles.gridCell}
              onClick={() => {/* Handle number click */}}
            >
              {number}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderFreeMode = () => {
    return (
      <div className={styles.freeContainer}>
        {freeNumbers.map((numberObj, index) => (
          <div
            key={index}
            className={styles.freeNumber}
            style={{
              left: `${numberObj.x}%`,
              top: `${numberObj.y}%`
            }}
            onClick={() => {/* Handle number click */}}
          >
            {numberObj.value}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.pauseButton}
          onClick={handlePauseClick}
        >
          {isPaused ? '▶️' : '⏸️'}
        </button>
        
        <div className={styles.instructionText}>
          Find {currentNumber}
        </div>
        
        <div className={styles.statsContainer}>
          {mode !== 'zen' && (
            <div className={styles.timeDisplay}>
              time: {timeLeft / 20}s/100s
            </div>
          )}
          <div className={styles.scoreDisplay}>
            score: {score}
          </div>
          {mode === 'zen' && (
            <div className={styles.livesDisplay}>
              lives: {lives}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.gameContent}>
        {type === 'grid' ? renderGridMode() : renderFreeMode()}
      </div>
      
      {isPaused && (
        <div className={styles.pauseOverlay}>
          <div className={styles.pauseMenu}>
            <h2>Game Paused</h2>
            <button onClick={() => setIsPaused(false)}>Resume</button>
            <button onClick={() => navigate(`/game-mode/${type}`)}>Exit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameplayScreen;