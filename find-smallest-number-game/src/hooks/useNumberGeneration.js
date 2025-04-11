/**
 * Custom hook to handle number generation and management:
 * - Generating numbers for grid and free modes
 * - Tracking the target number (smallest number)
 * - Handling distracting numbers and duplicates
 */
import { useState, useCallback, useEffect } from 'react';
import { DIFFICULTY_LEVELS, HARD_MODE_DISTRACTION_COUNT } from '../constants/difficulty';
import { generateContrastingColors } from '../utils/colorUtils';

export const useNumberGeneration = (settings, type, mode) => {
  const [targetNumber, setTargetNumber] = useState(null);
  const [gridNumbers, setGridNumbers] = useState([]);
  const [freeNumbers, setFreeNumbers] = useState([]);
  const [foundNumbers, setFoundNumbers] = useState([]);
  const [colors, setColors] = useState([]);
  const [distractingNumbers, setDistractingNumbers] = useState([]);

  // Generate contrasting colors for numbers
  useEffect(() => {
    const difficulty = settings.difficulty || DIFFICULTY_LEVELS.NORMAL;
    
    if (difficulty === DIFFICULTY_LEVELS.HARD) {
      // Tạo mảng màu tương phản đẹp
      const totalNumbers = 
        type === 'grid' 
          ? settings.gridSize * settings.gridSize 
          : settings.maxNumbers;
          
      setColors(generateContrastingColors(totalNumbers));
    }
  }, [settings, type]);

  const generateGridNumbers = useCallback(() => {
    const { minNumber, maxNumber, gridSize, difficulty } = settings;
    let totalCells = gridSize * gridSize;
    const uniqueNumbers = new Set();
    
    // Độ khó ảnh hưởng đến cách sinh số
    const isHardMode = difficulty === DIFFICULTY_LEVELS.HARD;
    
    // Số lượng số nhiễu và số trùng lặp
    const distractionCount = isHardMode ? HARD_MODE_DISTRACTION_COUNT : 0;
    const duplicateCount = isHardMode ? 2 : 0; // Thêm số trùng lặp ở hard mode
    
    // Mảng lưu các loại số
    const distractingNums = [];
    const duplicateNums = [];
    
    // Đảm bảo số nhỏ nhất được tạo trước
    let smallestNumber;
    
    // Với hard mode, thêm khả năng số nhỏ nhất nằm ngoài phạm vi
    if (isHardMode && Math.random() > 0.7) {
      // 30% khả năng số nhỏ nhất nằm ngoài phạm vi (nhưng vẫn lớn hơn 0)
      smallestNumber = Math.max(1, Math.floor(Math.random() * (minNumber - 1)));
    } else {
      // Số nhỏ nhất nằm trong phạm vi
      smallestNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }
    
    // Thêm số nhỏ nhất vào mảng
    uniqueNumbers.add(smallestNumber);
    
    // Sinh các số cơ bản trong phạm vi (không trùng với số nhỏ nhất)
    while (uniqueNumbers.size < totalCells - distractionCount - duplicateCount) {
      const newNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      
      // Đảm bảo số này không phải là số nhỏ nhất
      if (newNumber !== smallestNumber) {
        uniqueNumbers.add(newNumber);
      }
    }
    
    // Chuyển set thành mảng để dễ thao tác
    const numbersArray = Array.from(uniqueNumbers);
    
    // Thêm số nhiễu ngoài phạm vi cho hard mode
    if (isHardMode) {
      for (let i = 0; i < distractionCount; i++) {
        // Tạo số lớn hơn maxNumber
        const largerNumber = Math.floor(Math.random() * 1000) + maxNumber;
        distractingNums.push(largerNumber);
      }
      
      // Thêm số trùng lặp (chỉ trùng lặp số trong mảng nhưng không phải số nhỏ nhất)
      for (let i = 0; i < duplicateCount; i++) {
        if (numbersArray.length > 1) { // Đảm bảo có ít nhất 2 số để chọn
          // Lấy số ngẫu nhiên từ mảng (không lấy phần tử đầu tiên là số nhỏ nhất)
          const randomIndex = Math.floor(Math.random() * (numbersArray.length - 1)) + 1;
          const numberToDuplicate = numbersArray[randomIndex];
          duplicateNums.push(numberToDuplicate);
        }
      }
    }
    
    // Lưu trữ thông tin số gây xao nhãng
    setDistractingNumbers([...distractingNums, ...duplicateNums]);
    
    // Kết hợp tất cả số và xáo trộn
    const allNumbers = [...numbersArray, ...distractingNums, ...duplicateNums];
    const shuffled = shuffleArray([...allNumbers]);
    
    // Cập nhật các state
    setGridNumbers(shuffled);
    setTargetNumber(smallestNumber);
    setFoundNumbers([]);
  }, [settings]);

  const generateFreeNumbers = useCallback(() => {
    const { minNumber, maxNumber, maxNumbers, difficulty } = settings;
    const uniqueNumbers = new Set();
    
    // Độ khó ảnh hưởng đến cách sinh số
    const isHardMode = difficulty === DIFFICULTY_LEVELS.HARD;
    
    // Số lượng số nhiễu và số trùng lặp
    const distractionCount = isHardMode ? HARD_MODE_DISTRACTION_COUNT : 0;
    const duplicateCount = isHardMode ? 2 : 0; // Thêm số trùng lặp ở hard mode
    
    // Mảng lưu các loại số
    const distractingNums = [];
    const duplicateNums = [];
    
    // Đảm bảo số nhỏ nhất được tạo trước
    let smallestNumber;
    
    // Với hard mode, thêm khả năng số nhỏ nhất nằm ngoài phạm vi
    if (isHardMode && Math.random() > 0.7) {
      // 30% khả năng số nhỏ nhất nằm ngoài phạm vi (nhưng vẫn lớn hơn 0)
      smallestNumber = Math.max(1, Math.floor(Math.random() * (minNumber - 1)));
    } else {
      // Số nhỏ nhất nằm trong phạm vi
      smallestNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    }
    
    // Thêm số nhỏ nhất vào mảng
    uniqueNumbers.add(smallestNumber);
    
    // Sinh các số cơ bản trong phạm vi (không trùng với số nhỏ nhất)
    while (uniqueNumbers.size < maxNumbers - distractionCount - duplicateCount) {
      const newNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      
      // Đảm bảo số này không phải là số nhỏ nhất
      if (newNumber !== smallestNumber) {
        uniqueNumbers.add(newNumber);
      }
    }
    
    // Chuyển set thành mảng để dễ thao tác
    const numbersArray = Array.from(uniqueNumbers);
    
    // Thêm số nhiễu ngoài phạm vi cho hard mode
    if (isHardMode) {
      for (let i = 0; i < distractionCount; i++) {
        // Tạo số lớn hơn maxNumber
        const largerNumber = Math.floor(Math.random() * 1000) + maxNumber;
        distractingNums.push(largerNumber);
      }
      
      // Thêm số trùng lặp (chỉ trùng lặp số trong mảng nhưng không phải số nhỏ nhất)
      for (let i = 0; i < duplicateCount; i++) {
        if (numbersArray.length > 1) { // Đảm bảo có ít nhất 2 số để chọn
          // Lấy số ngẫu nhiên từ mảng (không lấy phần tử đầu tiên là số nhỏ nhất)
          const randomIndex = Math.floor(Math.random() * (numbersArray.length - 1)) + 1;
          const numberToDuplicate = numbersArray[randomIndex];
          duplicateNums.push(numberToDuplicate);
        }
      }
    }
    
    // Lưu trữ thông tin số gây xao nhãng
    setDistractingNumbers([...distractingNums, ...duplicateNums]);
    
    // Kết hợp tất cả số
    const allNumbers = [...numbersArray, ...distractingNums, ...duplicateNums];
    
    // Tạo vị trí tốt hơn với phần phối đều
    setFreeNumbers(distributeNumbersEvenly(allNumbers, isHardMode));
    setTargetNumber(smallestNumber);
    setFoundNumbers([]);
  }, [settings]);
  
  // Shuffle grid numbers
  const shuffleGridNumbers = useCallback(() => {
    const difficulty = settings.difficulty || DIFFICULTY_LEVELS.NORMAL;
    const isHardMode = difficulty === DIFFICULTY_LEVELS.HARD;
    
    if (isHardMode) {
      // Hard mode: thay đổi một số giá trị khi xáo trộn
      const newNumbers = [...gridNumbers];
      const changeCount = Math.min(3, Math.floor(newNumbers.length / 10));
      
      for (let i = 0; i < changeCount; i++) {
        // Chọn một vị trí ngẫu nhiên để thay đổi
        const randomIndex = Math.floor(Math.random() * newNumbers.length);
        
        // Thay đổi giá trị nhưng đảm bảo không làm thay đổi số nhỏ nhất
        if (newNumbers[randomIndex] !== targetNumber && 
            !distractingNumbers.includes(newNumbers[randomIndex])) {
          const { minNumber, maxNumber } = settings;
          
          // Tạo một số ngẫu nhiên mới
          const newValue = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
          // Đảm bảo số mới không phải số nhỏ nhất
          if (newValue !== targetNumber) {
            newNumbers[randomIndex] = newValue;
          }
        }
      }
      
      setGridNumbers(shuffleArray(newNumbers));
    } else {
      // Normal/Easy mode: chỉ xáo trộn vị trí
      setGridNumbers(shuffleArray([...gridNumbers]));
    }
  }, [gridNumbers, settings, targetNumber, distractingNumbers]);
  
  // Shuffle free numbers
  const shuffleFreeNumbers = useCallback(() => {
    const difficulty = settings.difficulty || DIFFICULTY_LEVELS.NORMAL;
    const isHardMode = difficulty === DIFFICULTY_LEVELS.HARD;
    
    if (isHardMode) {
      // Hard mode: thay đổi một số giá trị và vị trí
      const values = freeNumbers.map(item => item.value);
      const changeCount = Math.min(3, Math.floor(values.length / 10));
      
      for (let i = 0; i < changeCount; i++) {
        // Chọn một vị trí ngẫu nhiên để thay đổi
        const randomIndex = Math.floor(Math.random() * values.length);
        
        // Thay đổi giá trị nhưng đảm bảo không làm thay đổi số nhỏ nhất
        if (values[randomIndex] !== targetNumber && 
            !distractingNumbers.includes(values[randomIndex])) {
          const { minNumber, maxNumber } = settings;
          
          // Tạo một số ngẫu nhiên mới
          const newValue = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
          // Đảm bảo số mới không phải số nhỏ nhất
          if (newValue !== targetNumber) {
            values[randomIndex] = newValue;
          }
        }
      }
      
      // Tạo vị trí mới, thêm yếu tố bất ngờ hơn
      setFreeNumbers(distributeNumbersRandomly(values, isHardMode));
    } else {
      // Normal/Easy mode: chỉ xáo trộn vị trí
      const values = freeNumbers.map(item => item.value);
      setFreeNumbers(distributeNumbersEvenly(values, isHardMode));
    }
  }, [freeNumbers, settings, targetNumber, distractingNumbers]);
  
  // Update target number based on remaining numbers
  const updateTargetNumber = useCallback((remainingNumbers) => {
    if (remainingNumbers.length > 0) {
      setTargetNumber(Math.min(...remainingNumbers));
    } else {
      setTargetNumber(null); // No numbers left
    }
  }, []);
  
  // Helper function to shuffle an array (Fisher-Yates)
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  // Distribute numbers evenly across the screen for free mode
  const distributeNumbersEvenly = (values, isHardMode) => {
    const result = [];
    const gridSize = Math.ceil(Math.sqrt(values.length));
    const cellSize = 100 / gridSize;
    
    // Create a grid layout but with random variation within each cell
    values.forEach((value, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      // Base position (center of the cell)
      let x = (col * cellSize) + (cellSize / 2);
      let y = (row * cellSize) + (cellSize / 2);
      
      // Add random variation
      const variation = isHardMode ? cellSize * 0.4 : cellSize * 0.3;
      x += (Math.random() * variation) - (variation / 2);
      y += (Math.random() * variation) - (variation / 2);
      
      // Ensure numbers stay within screen bounds
      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));
      
      result.push({ value, x, y });
    });
    
    return result;
  };
  
  // Distribute numbers randomly (more suitable for hard mode)
  const distributeNumbersRandomly = (values, isHardMode) => {
    const result = [];
    const minDistance = isHardMode ? 10 : 15; // Minimum distance between numbers
    const placedPositions = [];
    
    // Helper to check if a position is too close to existing positions
    const isTooClose = (x, y) => {
      return placedPositions.some(pos => {
        const dx = pos.x - x;
        const dy = pos.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minDistance;
      });
    };
    
    // Place each number
    values.forEach(value => {
      let x, y;
      let attempts = 0;
      
      // Try to find a valid position
      do {
        x = 5 + Math.random() * 90; // 5-95%
        y = 5 + Math.random() * 90; // 5-95%
        attempts++;
      } while (isTooClose(x, y) && attempts < 100);
      
      // Add position to tracking array
      placedPositions.push({ x, y });
      
      // Add to result
      result.push({ value, x, y });
    });
    
    return result;
  };

  return {
    targetNumber,
    gridNumbers,
    freeNumbers,
    foundNumbers,
    setFoundNumbers,
    distractingNumbers,
    generateGridNumbers,
    generateFreeNumbers,
    shuffleGridNumbers,
    shuffleFreeNumbers,
    updateTargetNumber,
  };
};