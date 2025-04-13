import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/NumberBox.module.css';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';
import { generateRandomColor, getTextColorForBackground } from '../utils/colorUtils';

const NumberBox = ({ 
  number, 
  isTarget, 
  isFound, 
  onClick,
  difficulty = DIFFICULTY_LEVELS.NORMAL // 'easy', 'normal', 'hard'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });
  const [randomColor, setRandomColor] = useState(null);
  const [isWrong, setIsWrong] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const boxRef = useRef(null);

  // Khởi tạo màu ngẫu nhiên cho chế độ hard
  useEffect(() => {
    if (difficulty === DIFFICULTY_LEVELS.HARD && !randomColor) {
      setRandomColor(generateRandomColor());
    }
  }, [difficulty, randomColor]);
  
  // Hiệu ứng di chuyển cho chế độ hard
  useEffect(() => {
    if (difficulty === DIFFICULTY_LEVELS.HARD && isHovered && !isFound) {
      // Tạo vị trí ngẫu nhiên trong phạm vi nhỏ
      const interval = setInterval(() => {
        setRandomOffset({
          x: Math.random() * 5 - 2.5, // -2.5px to 2.5px
          y: Math.random() * 5 - 2.5
        });
      }, 100);
      
      return () => clearInterval(interval);
    } else {
      setRandomOffset({ x: 0, y: 0 });
    }
  }, [isHovered, difficulty, isFound]);
  
  // Hiệu ứng khi tìm thấy số
  useEffect(() => {
    if (isFound) {
      setShowAnimation(true);
      
      // Loại bỏ animation sau khi hoàn thành
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isFound]);
  
  const getClassNames = () => {
    let classNames = styles.numberBox;
    
    // Thêm class dựa vào trạng thái
    if (isFound) {
      classNames += ` ${styles.found}`;
      
      if (showAnimation) {
        classNames += ` ${styles.animation}`;
      }
    } else if (isTarget) {
      classNames += ` ${styles.target}`;
    }
    
    if (isHovered && !isFound) {
      classNames += ` ${styles.hovered}`;
    }
    
    if (isWrong) {
      classNames += ` ${styles.wrong}`;
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
      // Nếu không phải số đích, hiển thị hiệu ứng sai
      if (number !== isTarget) {
        setIsWrong(true);
        
        // Tắt hiệu ứng sai sau 400ms
        setTimeout(() => {
          setIsWrong(false);
        }, 400);
      }
      
      onClick(number);
    }
  };
  
  // Lấy background color dựa vào độ khó
  const getBackgroundStyle = () => {
    // Nếu số đã tìm thấy và ở chế độ normal, chỉ đổi màu text thành xám như nền, không đổi màu nền
    if (isFound && difficulty === DIFFICULTY_LEVELS.NORMAL) {
      return { 
        backgroundColor: '#f0f0f0', // Giữ nguyên màu nền
        color: '#f0f0f0'  // Đổi màu text thành màu giống nền (xám)
      };
    }
    
    // Nếu số đã tìm thấy và ở chế độ hard, ẩn số (background và số cùng màu)
    if (isFound && difficulty === DIFFICULTY_LEVELS.HARD) {
      return { backgroundColor: '#4CEEAD', color: '#4CEEAD' };
    } 
    
    // Với chế độ hard, mỗi số có màu riêng
    if (difficulty === DIFFICULTY_LEVELS.HARD && !isFound) {
      return { 
        backgroundColor: randomColor,
        color: getTextColorForBackground(randomColor) // Đảm bảo màu text đủ tương phản
      };
    }
    
    return {};
  };
  
  return (
    <div
      ref={boxRef}
      className={getClassNames()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${randomOffset.x}px, ${randomOffset.y}px)`,
        ...getBackgroundStyle()
      }}
    >
      {number}
    </div>
  );
};

export default NumberBox;