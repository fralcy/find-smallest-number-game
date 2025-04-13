import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/NumberBox.module.css';
import { DIFFICULTY_LEVELS } from '../constants/difficulty';
import { generateRandomColor, getTextColorForBackground } from '../utils/colorUtils';

const NumberBox = ({ 
  number, 
  isTarget, 
  isFound, 
  onClick,
  difficulty = DIFFICULTY_LEVELS.NORMAL, // 'easy', 'normal', 'hard'
  isZenMode = false // Thêm prop isZenMode
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [randomOffset, setRandomOffset] = useState({ x: 0, y: 0 });
  const [randomColor, setRandomColor] = useState(null);
  const [isWrong, setIsWrong] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const boxRef = useRef(null);

  // Khởi tạo màu ngẫu nhiên cho chế độ hard và zen mode
  useEffect(() => {
    if ((difficulty === DIFFICULTY_LEVELS.HARD || isZenMode) && !randomColor) {
      setRandomColor(generateRandomColor());
    }
  }, [difficulty, randomColor, isZenMode]);

  // Hiệu ứng di chuyển cho chế độ hard (không áp dụng cho zen mode)
  useEffect(() => {
    if (difficulty === DIFFICULTY_LEVELS.HARD && !isZenMode && isHovered && !isFound) {
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
  }, [isHovered, difficulty, isFound, isZenMode]);
  
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
    
    // Thêm class zen mode nếu cần
    if (isZenMode) {
      classNames += ` ${styles.zenMode}`;
    }
    
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
      if (!isTarget) {
        setIsWrong(true);
        
        // Tắt hiệu ứng sai sau 400ms
        setTimeout(() => {
          setIsWrong(false);
        }, 400);
      }
      
      onClick(number);
    }
  };
  // Hàm tạo màu chữ khác với màu nền
  const getContrastingTextColor = (backgroundColor) => {
    if (!backgroundColor) return '#333333';
    
    // Chuyển đổi màu nền thành dạng chuỗi
    const bgColor = String(backgroundColor);
    
    // Nếu màu nền là HSL, tạo một màu HSL khác
    if (bgColor.includes('hsl')) {
      const matches = bgColor.match(/hsl\(\s*(\d+)\s*,\s*\d+%\s*,\s*\d+%\s*\)/);
      if (matches && matches[1]) {
        // Đảo ngược hue
        const hue = (parseInt(matches[1], 10) + 180) % 360;
        return `hsl(${hue}, 100%, 30%)`;
      }
    }
    
    // Màu mặc định
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8', '#33FFF6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Lấy background color dựa vào độ khó và chế độ
  const getBackgroundStyle = () => {
    // Nếu số đã tìm thấy và ở chế độ normal, chỉ đổi màu text thành xám như nền, không đổi màu nền
    if (isFound && difficulty === DIFFICULTY_LEVELS.NORMAL && !isZenMode) {
      return { 
        backgroundColor: '#f0f0f0', // Giữ nguyên màu nền
        color: '#f0f0f0'  // Đổi màu text thành màu giống nền (xám)
      };
    }
    
    // Nếu số đã tìm thấy và ở chế độ hard, ẩn số (background và số cùng màu)
    if (isFound && difficulty === DIFFICULTY_LEVELS.HARD && !isZenMode) {
      return { backgroundColor: '#4CEEAD', color: '#4CEEAD' };
    }
    
    // Nếu là Zen mode, mỗi số có màu ngẫu nhiên riêng
    if (isZenMode) {
      if (isFound) {
        return { backgroundColor: '#4CEEAD', color: 'white' };
      }
      
      // Đảm bảo có màu ngẫu nhiên cho nền
      const bgColor = randomColor || generateRandomColor();
      
      // Nếu vẫn chưa có màu, dùng màu mặc định
      if (!bgColor) {
        return { backgroundColor: '#f0f0f0', color: '#333' };
      }
      
      // Tạo màu chữ khác với màu nền
      const textColor = getContrastingTextColor(bgColor);
      
      return { 
        backgroundColor: bgColor,
        color: textColor
      };
    }
    
    // Với chế độ hard, mỗi số có màu riêng
    if (difficulty === DIFFICULTY_LEVELS.HARD && !isFound) {
      // Đảm bảo có màu ngẫu nhiên
      const bgColor = randomColor || generateRandomColor();
      
      // Nếu vẫn chưa có màu, dùng màu mặc định
      if (!bgColor) {
        return { backgroundColor: '#f0f0f0', color: '#333' };
      }
      
      return { 
        backgroundColor: bgColor,
        color: getTextColorForBackground(bgColor) // Đảm bảo màu text đủ tương phản
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