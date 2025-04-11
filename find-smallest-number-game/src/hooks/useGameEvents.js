/**
 * Custom hook để xử lý các sự kiện tương tác trong game:
 * - Xử lý khi người chơi nhấp vào số
 * - Xử lý đáp án đúng và sai
 * - Điều chỉnh logic game dựa vào độ khó
 * - Cập nhật trạng thái game dựa trên hành động của người chơi
 */
import { useState, useEffect } from 'react';
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
  shuffleFreeNumbers,
  settings
) => {
  const [currentNumber, setCurrentNumber] = useState(null);
  const [comboCount, setComboCount] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [showTargetNumber, setShowTargetNumber] = useState(true);
  
  // Xác định độ khó hiện tại từ settings
  const getDifficulty = () => {
    return settings?.difficulty || DIFFICULTY_LEVELS.NORMAL;
  };
  
  // Ẩn target number sau một khoảng thời gian với chế độ NORMAL và HARD
  useEffect(() => {
    const difficulty = getDifficulty();
    
    // Nếu là chế độ EASY, luôn hiển thị target number
    if (difficulty === DIFFICULTY_LEVELS.EASY) {
      setShowTargetNumber(true);
      return;
    }
    
    // Đối với NORMAL, ẩn sau 3 số đầu tiên
    if (difficulty === DIFFICULTY_LEVELS.NORMAL && foundNumbers.length >= 3) {
      setShowTargetNumber(false);
    }
    
    // Đối với HARD, ẩn ngay sau khi tìm thấy số đầu tiên
    if (difficulty === DIFFICULTY_LEVELS.HARD && foundNumbers.length >= 1) {
      setShowTargetNumber(false);
    }
  }, [foundNumbers.length, getDifficulty]);
  
  // Xử lý khi người chơi nhấp vào số trong chế độ lưới
  const handleGridNumberClick = (number, index) => {
    const difficulty = getDifficulty();
    
    if (number === targetNumber) {
      // Số đúng
      handleCorrectNumber(number);
      
      // Tùy theo độ khó mà có các hành vi khác nhau
      if (difficulty === DIFFICULTY_LEVELS.HARD || mode === 'zen') {
        // Hard mode: tạo lưới mới sau mỗi câu trả lời đúng
        setTimeout(() => generateGridNumbers(), 500);
      } else if (difficulty === DIFFICULTY_LEVELS.NORMAL) {
        // Normal mode: xáo trộn sau mỗi 3 câu trả lời đúng liên tiếp
        if (comboCount > 0 && comboCount % 3 === 0) {
          setTimeout(() => shuffleGridNumbers(), 500);
        }
      }
    } else {
      // Số sai
      handleWrongNumber();
      
      // Hành vi xáo trộn khi trả lời sai tùy thuộc vào độ khó
      if (difficulty === DIFFICULTY_LEVELS.HARD) {
        // Hard mode: xáo trộn ngay lập tức
        shuffleGridNumbers();
      } else if (difficulty === DIFFICULTY_LEVELS.NORMAL && consecutiveWrong >= 2) {
        // Normal mode: xáo trộn sau 2 lần sai liên tiếp
        shuffleGridNumbers();
        setConsecutiveWrong(0);
      }
    }
  };
  
  // Xử lý khi người chơi nhấp vào số trong chế độ tự do
  const handleFreeNumberClick = (numberObj, index) => {
    const difficulty = getDifficulty();
    
    if (numberObj.value === targetNumber) {
      // Số đúng
      handleCorrectNumber(numberObj.value);
      
      // Tùy theo độ khó mà có các hành vi khác nhau
      if (difficulty === DIFFICULTY_LEVELS.HARD || mode === 'zen') {
        // Hard mode: tạo số mới sau mỗi câu trả lời đúng
        setTimeout(() => generateFreeNumbers(), 500);
      } else if (difficulty === DIFFICULTY_LEVELS.NORMAL) {
        // Normal mode: xáo trộn sau mỗi 3 câu trả lời đúng liên tiếp
        if (comboCount > 0 && comboCount % 3 === 0) {
          setTimeout(() => shuffleFreeNumbers(), 500);
        }
      }
    } else {
      // Số sai
      handleWrongNumber();
      
      // Hành vi xáo trộn khi trả lời sai tùy thuộc vào độ khó
      if (difficulty === DIFFICULTY_LEVELS.HARD) {
        // Hard mode: xáo trộn ngay lập tức
        shuffleFreeNumbers();
      } else if (difficulty === DIFFICULTY_LEVELS.NORMAL && consecutiveWrong >= 2) {
        // Normal mode: xáo trộn sau 2 lần sai liên tiếp
        shuffleFreeNumbers();
        setConsecutiveWrong(0);
      }
    }
  };
  
  // Xử lý khi người chơi tìm thấy số đúng
  const handleCorrectNumber = (number) => {
    // Phát âm thanh đúng
    audioManager.play('correct');
    
    // Tăng combo đúng và reset combo sai
    setComboCount(prev => prev + 1);
    setConsecutiveWrong(0);
    
    if (mode === 'zen') {
      // Trong chế độ zen, tăng điểm cho mỗi câu trả lời đúng
      const difficulty = getDifficulty();
      const basePoints = 10;
      const difficultyMultiplier = DIFFICULTY_SCORE_MULTIPLIER[difficulty] || 1;
      const comboBonus = Math.floor(comboCount / 3) * 2; // +2 điểm cho mỗi 3 combo
      
      const totalPoints = Math.ceil(basePoints * difficultyMultiplier) + comboBonus;
      setScore(prevScore => prevScore + totalPoints);
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
    const comboBonus = Math.floor(comboCount / 3) * 5; // +5 điểm cho mỗi 3 combo
    
    const totalPoints = Math.ceil(basePoints * difficultyMultiplier) + comboBonus;
    
    setScore(prevScore => prevScore + totalPoints);
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
    
    // Reset combo đúng và tăng combo sai
    setComboCount(0);
    setConsecutiveWrong(prev => prev + 1);

    // Xác định độ khó hiện tại để tính toán trừ điểm
    const difficulty = getDifficulty();
    const penaltyMultiplier = {
      [DIFFICULTY_LEVELS.EASY]: 0.5,    // Ít bị phạt nhất
      [DIFFICULTY_LEVELS.NORMAL]: 1,    // Phạt bình thường
      [DIFFICULTY_LEVELS.HARD]: 1.5     // Phạt nhiều nhất
    }[difficulty] || 1;
    
    // Tăng phạt nếu nhiều lần sai liên tiếp
    const consecutivePenalty = consecutiveWrong >= 3 ? 1.5 : (consecutiveWrong >= 2 ? 1.2 : 1);

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
      const basePenalty = 10;
      const totalPenalty = Math.round(basePenalty * penaltyMultiplier * consecutivePenalty);
      setScore(prev => Math.max(0, prev - totalPenalty));
      
      // Ở chế độ hard, giảm thêm thời gian khi trả lời sai
      if (difficulty === DIFFICULTY_LEVELS.HARD && mode !== 'zen') {
        // Giảm 3 giây khi trả lời sai (chỉ dành cho normal và campaign mode)
        // Chú ý: Bạn cần thêm callback trong component GameplayScreen để cho phép giảm thời gian
        // setTimeLeft(prev => Math.max(1, prev - 3));
      }
    }
  };

  return {
    currentNumber,
    setCurrentNumber,
    comboCount,
    consecutiveWrong,
    showTargetNumber,
    getDifficulty,
    handleGridNumberClick,
    handleFreeNumberClick
  };
};