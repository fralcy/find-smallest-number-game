// Tạo số ngẫu nhiên trong phạm vi
export const getRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  
  // Tính toán số điểm khi tìm thấy số
  export const calculateScore = (timeLeft, difficulty = 'normal') => {
    const basePoints = Math.ceil(timeLeft / 10);
    
    // Điều chỉnh điểm theo độ khó
    switch (difficulty) {
      case 'easy':
        return basePoints * 0.8;
      case 'normal':
        return basePoints;
      case 'hard':
        return basePoints * 1.2;
      default:
        return basePoints;
    }
  };
  
  // Tạo vị trí ngẫu nhiên cho số trong chế độ free
  export const generateRandomPosition = (existingPositions, minDistance = 10) => {
    let x, y, isValidPosition;
    
    do {
      x = Math.random() * 80 + 10; // Random x position (10% to 90%)
      y = Math.random() * 70 + 15; // Random y position (15% to 85%)
      
      // Kiểm tra khoảng cách với các vị trí đã tồn tại
      isValidPosition = existingPositions.every(pos => {
        const distance = Math.sqrt(Math.pow(pos.x - x, 2) + Math.pow(pos.y - y, 2));
        return distance >= minDistance;
      });
    } while (!isValidPosition);
    
    return { x, y };
  };
  
  // Tính số lỗi tối đa cho phép dựa vào độ khó và số lượng số
  export const calculateMaxErrors = (difficulty, totalNumbers) => {
    switch (difficulty) {
      case 'easy':
        return Math.ceil(totalNumbers * 0.5); // 50% số lượng số
      case 'normal':
        return Math.ceil(totalNumbers * 0.3); // 30% số lượng số
      case 'hard':
        return Math.ceil(totalNumbers * 0.2); // 20% số lượng số
      default:
        return 3; // Mặc định cho Zen mode
    }
  };
  
  // Kiểm tra xem game có thể kết thúc theo thời gian hay không
  export const isTimeBased = (mode) => {
    return mode !== 'zen';
  };
  
  // Kiểm tra xem game có theo mạng hay không
  export const isLivesBased = (mode) => {
    return mode === 'zen';
  };
  
  // Tính thời gian mặc định cho mỗi số dựa vào độ khó
  export const getDefaultTimePerNumber = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 6;
      case 'normal':
        return 4;
      case 'hard':
        return 2.5;
      default:
        return 4;
    }
  };
  
  // Kiểm tra xem level đã hoàn thành với số sao đạt được
  export const isLevelCompleted = (levelData, requiredStars = 1) => {
    return levelData.stars >= requiredStars;
  };
  
  // Tạo ID duy nhất cho level (để truy xuất trong localStorage)
  export const generateLevelId = (type, mode, level) => {
    return `${type}_${mode}_${level}`;
  };