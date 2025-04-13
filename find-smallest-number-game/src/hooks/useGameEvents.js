/**
 * Custom hook để xử lý các sự kiện tương tác trong game:
 * - Xử lý khi người chơi nhấp vào số
 * - Xử lý đáp án đúng và sai
 * - Điều chỉnh logic game dựa vào độ khó
 * - Xử lý số gây xao nhãng và trùng lặp
 */
import { useState, useEffect, useRef } from 'react';
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
  distractingNumbers,
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
  const [foundIndices, setFoundIndices] = useState([]); // Lưu các vị trí đã tìm thấy
  
  // Thêm các tham chiếu để ngăn vòng lặp vô tận
  const isProcessingClick = useRef(false);
  const pendingGridUpdate = useRef(false);
  const pendingFreeUpdate = useRef(false);
  
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
  }, [foundNumbers.length]);
  
  // Thực hiện các thao tác trễ sau khi xử lý đúng
  useEffect(() => {
    // Xử lý cập nhật cho grid mode
    if (pendingGridUpdate.current) {
      pendingGridUpdate.current = false;
      const difficulty = getDifficulty();
      
      if (difficulty === DIFFICULTY_LEVELS.HARD || mode === 'zen') {
        // Hard mode: tạo lưới mới sau mỗi câu trả lời đúng
        setTimeout(() => {
          if (type === 'grid' && foundNumbers.length < gridNumbers.length - 1) {
            generateGridNumbers();
            setFoundIndices([]); // Reset foundIndices khi tạo lưới mới
          }
        }, 500);
      } else if (difficulty === DIFFICULTY_LEVELS.NORMAL) {
        // Normal mode: xáo trộn sau mỗi 3 câu trả lời đúng liên tiếp
        if (comboCount > 0 && comboCount % 3 === 0) {
          setTimeout(() => {
            shuffleGridNumbers();
            setFoundIndices([]); // Reset foundIndices khi xáo trộn
          }, 500);
        }
      }
    }
  }, [comboCount, foundNumbers.length, gridNumbers.length, mode]);
  
  // Thực hiện các thao tác trễ cho free mode
  useEffect(() => {
    // Xử lý cập nhật cho free mode
    if (pendingFreeUpdate.current) {
      pendingFreeUpdate.current = false;
      const difficulty = getDifficulty();
      
      if (difficulty === DIFFICULTY_LEVELS.HARD || mode === 'zen') {
        // Hard mode: tạo số mới sau mỗi câu trả lời đúng
        setTimeout(() => {
          if (type === 'free' && foundNumbers.length < freeNumbers.length - 1) {
            generateFreeNumbers();
            setFoundIndices([]); // Reset foundIndices khi tạo vị trí mới
          }
        }, 500);
      } else if (difficulty === DIFFICULTY_LEVELS.NORMAL) {
        // Normal mode: xáo trộn sau mỗi 3 câu trả lời đúng liên tiếp
        if (comboCount > 0 && comboCount % 3 === 0) {
          setTimeout(() => {
            shuffleFreeNumbers();
            setFoundIndices([]); // Reset foundIndices khi xáo trộn
          }, 500);
        }
      }
    }
  }, [comboCount, foundNumbers.length, freeNumbers.length, mode]);
  
  // Xử lý khi người chơi nhấp vào số trong chế độ lưới
  const handleGridNumberClick = (number, index) => {
    // Tránh xử lý nhiều lần cùng lúc
    if (isProcessingClick.current) return;
    isProcessingClick.current = true;
    
    const difficulty = getDifficulty();
    
    // Kiểm tra nếu vị trí này đã được tìm thấy
    if (foundIndices.includes(index)) {
      isProcessingClick.current = false;
      return;
    }
    
    if (number === targetNumber) {
      // Số đúng
      handleCorrectNumber(number, index);
      
      // Đánh dấu là cần cập nhật grid sau khi xử lý
      pendingGridUpdate.current = true;
    } else {
      // Số sai
      handleWrongNumber(number);
      
      // Hành vi xáo trộn khi trả lời sai tùy thuộc vào độ khó
      if (difficulty === DIFFICULTY_LEVELS.HARD) {
        // Hard mode: xáo trộn ngay lập tức
        shuffleGridNumbers();
        setFoundIndices([]); // Reset foundIndices khi xáo trộn
      } else if (difficulty === DIFFICULTY_LEVELS.NORMAL && consecutiveWrong >= 2) {
        // Normal mode: xáo trộn sau 2 lần sai liên tiếp
        shuffleGridNumbers();
        setFoundIndices([]); // Reset foundIndices khi xáo trộn
        setConsecutiveWrong(0);
      }
    }
    
    // Reset processing flag sau 100ms để tránh click dồn
    setTimeout(() => {
      isProcessingClick.current = false;
    }, 100);
  };
  
  // Xử lý khi người chơi nhấp vào số trong chế độ tự do
  const handleFreeNumberClick = (numberObj, index) => {
    // Tránh xử lý nhiều lần cùng lúc
    if (isProcessingClick.current) return;
    isProcessingClick.current = true;
    
    const difficulty = getDifficulty();
    
    // Kiểm tra nếu vị trí này đã được tìm thấy
    if (foundIndices.includes(index)) {
      isProcessingClick.current = false;
      return;
    }
    
    if (numberObj.value === targetNumber) {
      // Số đúng
      handleCorrectNumber(numberObj.value, index);
      
      // Đánh dấu là cần cập nhật free numbers sau khi xử lý
      pendingFreeUpdate.current = true;
    } else {
      // Số sai
      handleWrongNumber(numberObj.value);
      
      // Hành vi xáo trộn khi trả lời sai tùy thuộc vào độ khó
      if (difficulty === DIFFICULTY_LEVELS.HARD) {
        // Hard mode: xáo trộn ngay lập tức
        shuffleFreeNumbers();
        setFoundIndices([]); // Reset foundIndices khi xáo trộn
      } else if (difficulty === DIFFICULTY_LEVELS.NORMAL && consecutiveWrong >= 2) {
        // Normal mode: xáo trộn sau 2 lần sai liên tiếp
        shuffleFreeNumbers();
        setFoundIndices([]); // Reset foundIndices khi xáo trộn
        setConsecutiveWrong(0);
      }
    }
    
    // Reset processing flag sau 100ms để tránh click dồn
    setTimeout(() => {
      isProcessingClick.current = false;
    }, 100);
  };
  
  // Xử lý khi người chơi tìm thấy số đúng
  const handleCorrectNumber = (number, index) => {
    // Phát âm thanh đúng
    audioManager.play('correct');
    
    // Tăng combo đúng và reset combo sai
    setComboCount(prev => prev + 1);
    setConsecutiveWrong(0);
    
    // Lưu lại vị trí đã tìm thấy
    setFoundIndices(prev => [...prev, index]);
    
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
        const remainingNumbers = gridNumbers.filter((num, idx) => 
          !foundIndices.includes(idx) && !updatedFoundNumbers.includes(num) && idx !== index
        );
        updateTargetNumber(remainingNumbers);
      } else if (type === 'free') {
        const remainingNumbers = freeNumbers
          .filter((numObj, idx) => !foundIndices.includes(idx) && idx !== index)
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
    
    // Không cần thưởng cho số trùng lặp vì số nhỏ nhất không trùng lặp
    const totalPoints = Math.ceil(basePoints * difficultyMultiplier) + comboBonus;
    
    setScore(prevScore => prevScore + totalPoints);
    setNumbersFound(prev => prev + 1);
  
    // Kiểm tra xem game đã hoàn thành chưa
    if (type === 'grid' && foundIndices.length + 1 === gridNumbers.length) {
      handleGameComplete();
    } else if (type === 'free' && foundIndices.length + 1 === freeNumbers.length) {
      handleGameComplete();
    }
  };
  
  // Xử lý khi người chơi nhấp vào số sai
  const handleWrongNumber = (number) => {
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
    
    // Phạt thêm nếu chọn số gây xao nhãng
    const distractionPenalty = distractingNumbers.includes(number) ? 1.5 : 1;

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
      const totalPenalty = Math.round(basePenalty * penaltyMultiplier * consecutivePenalty * distractionPenalty);
      setScore(prev => Math.max(0, prev - totalPenalty));
    }
  };

  // Reset foundIndices khi số lượng grid hoặc free numbers thay đổi
  useEffect(() => {
    if (gridNumbers.length > 0 || freeNumbers.length > 0) {
      setFoundIndices([]);
    }
  }, [gridNumbers.length, freeNumbers.length]);

  // Tạo thông báo về số gây xao nhãng
  const getDistractingWarning = () => {
    if (getDifficulty() === DIFFICULTY_LEVELS.HARD && distractingNumbers.length > 0) {
      if (distractingNumbers.some(n => Array.isArray(n) ? false : (n < settings.minNumber || n > settings.maxNumber))) {
        return 'outOfRangeNumbers';
      }
      return null;
    }
    return null;
  };

  return {
    currentNumber,
    setCurrentNumber,
    comboCount,
    consecutiveWrong,
    showTargetNumber,
    foundIndices,
    getDifficulty,
    getDistractingWarning,
    handleGridNumberClick,
    handleFreeNumberClick
  };
};