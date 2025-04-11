/**
 * Custom hook để xử lý các sự kiện tương tác trong game:
 * - Xử lý khi người chơi nhấp vào số
 * - Xử lý đáp án đúng và sai
 * - Xác định độ khó của game
 * - Cập nhật trạng thái game dựa trên hành động của người chơi
 */
import { useState } from 'react';
import { DIFFICULTY_LEVELS, DIFFICULTY_SCORE_MULTIPLIER } from '../constants/difficulty';

export const useGameEvents = (
  type, 
  mode, 
  audioManager,
  targetNumber,
  gridNumbers,
  freeNumbers,
  foundNumbers,
  setFoundNumbers,
  score,
  setScore,
  timeLeft,
  lives,
  setLives,
  setNumbersFound,
  handleGameComplete,
  handleLifeOut,
  updateTargetNumber,
  generateGridNumbers,
  generateFreeNumbers,
  shuffleGridNumbers,
  shuffleFreeNumbers
) => {
  const [currentNumber, setCurrentNumber] = useState(null);
  
  // Xử lý khi người chơi nhấp vào số trong chế độ lưới
  const handleGridNumberClick = (number, index) => {    
    if (number === targetNumber) {
      // Số đúng
      handleCorrectNumber(number);
      
      // Đối với chế độ zen hoặc hard, tạo lưới mới sau khi trả lời đúng
      if (mode === 'zen' || 
          (mode === 'campaign' && getDifficulty() === DIFFICULTY_LEVELS.HARD)) {
        generateGridNumbers();
      }
    } else {
      // Số sai
      handleWrongNumber();
      
      // Đối với chế độ zen hoặc hard, xáo trộn lưới sau khi trả lời sai
      if (mode === 'zen' || 
          (mode === 'campaign' && getDifficulty() === DIFFICULTY_LEVELS.HARD)) {
        shuffleGridNumbers();
      }
    }
  };
  
  // Xử lý khi người chơi nhấp vào số trong chế độ tự do
  const handleFreeNumberClick = (numberObj, index) => {
    if (numberObj.value === targetNumber) {
      // Số đúng
      handleCorrectNumber(numberObj.value);
  
      // Đối với chế độ zen hoặc hard, tạo số mới
      if (mode === 'zen' || 
          (mode === 'campaign' && getDifficulty() === DIFFICULTY_LEVELS.HARD)) {
        generateFreeNumbers();
      }
    } else {
      // Số sai
      handleWrongNumber();
  
      // Đối với chế độ zen hoặc hard, xáo trộn vị trí của số
      if (mode === 'zen' || 
          (mode === 'campaign' && getDifficulty() === DIFFICULTY_LEVELS.HARD)) {
        shuffleFreeNumbers();
      }
    }
  };
  
  // Xử lý khi người chơi tìm thấy số đúng
  const handleCorrectNumber = (number) => {
    // Phát âm thanh đúng
    audioManager.play('correct');
    
    if (mode === 'zen') {
      // Trong chế độ zen, tăng điểm cho mỗi câu trả lời đúng
      setScore(prevScore => prevScore + 10);
      return;
    }
  
    // Cập nhật số đã tìm thấy và số mục tiêu
    setFoundNumbers(prev => {
      const updatedFoundNumbers = [...prev, number];
      
      // Cập nhật số mục tiêu dựa trên số còn lại
      if (type === 'grid') {
        const remainingNumbers = gridNumbers.filter(num => !updatedFoundNumbers.includes(num));
        updateTargetNumber(remainingNumbers);
      } else if (type === 'free') {
        const remainingNumbers = freeNumbers
          .map(numObj => numObj.value)
          .filter(num => !updatedFoundNumbers.includes(num));
        updateTargetNumber(remainingNumbers);
      }
  
      return updatedFoundNumbers;
    });
  
    // Tính điểm dựa trên độ khó
    const difficulty = getDifficulty();
    const basePoints = Math.ceil(timeLeft / 10);
    const difficultyMultiplier = DIFFICULTY_SCORE_MULTIPLIER[difficulty] || 1;
    const pointsForNumber = Math.ceil(basePoints * difficultyMultiplier);
    
    setScore(prevScore => prevScore + pointsForNumber);
    setNumbersFound(prev => prev + 1);
  
    // Kiểm tra xem game đã hoàn thành chưa
    if (type === 'grid' && foundNumbers.length + 1 === gridNumbers.length) {
      handleGameComplete();
    } else if (type === 'free' && foundNumbers.length + 1 === freeNumbers.length) {
      handleGameComplete();
    }
  };
  
  // Xử lý khi người chơi nhấp vào số sai
  const handleWrongNumber = () => {
    // Phát âm thanh sai
    audioManager.play('wrong');

    // Xác định độ khó hiện tại để tính toán trừ điểm
    const difficulty = getDifficulty();
    const penaltyMultiplier = {
      [DIFFICULTY_LEVELS.EASY]: 0.5,    // Ít bị phạt nhất
      [DIFFICULTY_LEVELS.NORMAL]: 1,    // Phạt bình thường
      [DIFFICULTY_LEVELS.HARD]: 1.5     // Phạt nhiều nhất
    }[difficulty] || 1;

    if (mode === 'zen') {
      // Giảm mạng trong chế độ zen
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          handleLifeOut();
        }
        return newLives;
      });
    } else {
      // Giảm điểm trong các chế độ khác, dựa vào độ khó
      const penalty = Math.round(10 * penaltyMultiplier);
      setScore(prev => Math.max(0, prev - penalty));
    }
  };
  
  // Xác định độ khó dựa trên cấp độ hoặc cài đặt
  const getDifficulty = () => {
    // Hàm này đơn giản hóa để demo
    if (mode === 'campaign') {
      // Sử dụng logic cụ thể cho campaign
      return DIFFICULTY_LEVELS.NORMAL; // Mặc định
    }
    return mode === 'zen' ? DIFFICULTY_LEVELS.HARD : DIFFICULTY_LEVELS.NORMAL;
  };

  return {
    currentNumber,
    setCurrentNumber,
    getDifficulty,
    handleGridNumberClick,
    handleFreeNumberClick
  };
};