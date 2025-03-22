import React, { useState, useEffect } from 'react';
import styles from '../styles/NumberBox.module.css';

const NumberBox = ({ 
  number, 
  isTarget, 
  isFound, 
  onClick,
  difficulty = 'normal' // 'easy', 'normal', 'hard'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });
  
  // Với level khó, thêm hiệu ứng di chuyển khi hover
  useEffect(() => {
    if (difficulty === 'hard' && isHovered && !isFound) {
      // Tạo vị trí ngẫu nhiên trong phạm vi nhỏ
      const interval = setInterval(() => {
        setRandomOffset({
          x: Math.random() * 3 - 1.5, // -1.5px to 1.5px
          y: Math.random() * 3 - 1.5
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setRandomOffset({ x: 0, y: 0 });
    }
  }, [isHovered, difficulty, isFound]);
  
  const getClassNames = () => {
    let classNames = styles.numberBox;
    
    if (isFound) {
      classNames += ` ${styles.found}`;
    } else if (isTarget) {
      classNames += ` ${styles.target}`;
    }
    
    if (isHovered && !isFound) {
      classNames += ` ${styles.hovered}`;
    }
    
    // Thêm style dựa vào mức độ khó
    classNames += ` ${styles[difficulty]}`;
    
    return classNames;
  };
  
  const handleMouseEnter = () => {
    setIsHovered(true);
  };
  
  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  
  const handleClick = () => {
    if (!isFound) {
      onClick(number);
    }
  };
  
  return (
    <div
      className={getClassNames()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${randomOffset.x}px, ${randomOffset.y}px)`
      }}
    >
      {number}
    </div>
  );
};

export default NumberBox;