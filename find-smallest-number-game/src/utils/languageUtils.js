  // Kho ngôn ngữ đơn giản cho game tìm số nhỏ nhất
  const translations = {
    vi: {
      // Chung
      'findSmallestNumber': 'Tìm số nhỏ nhất!',
      'play': 'Chơi',
      'settings': 'Cài đặt',
      'back': '←',
      'exit': 'Thoát',
      'replay': 'Chơi lại',
      'continue': 'Tiếp tục',
      'start': 'Bắt đầu',
      
      // Màn hình chọn chế độ
      'gameMode': 'Chế độ chơi',
      'gridMode': 'Chế độ lưới',
      'freeMode': 'Chế độ tự do',
      
      // Màn hình chi tiết chế độ
      'campaign': 'Chiến dịch',
      'custom': 'Tùy chỉnh',
      'zenMode': 'Chế độ vô tận',
      
      // Màn hình tùy chỉnh
      'customGridMode': 'Tùy chỉnh - Chế độ lưới',
      'customFreeMode': 'Tùy chỉnh - Chế độ tự do',
      'numberRange': 'Phạm vi số:',
      'min': 'Tối thiểu',
      'max': 'Tối đa',
      'gridSize': 'Kích thước lưới:',
      'maxNumbers': 'Số lượng tối đa:',
      'timePerNumber': 'Thời gian mỗi số:',
      'totalNumbers': 'Tổng số:',
      'totalTime': 'Tổng thời gian:',
      'startGame': 'Bắt đầu trò chơi',
      
      // Màn hình chiến dịch
      'campaignGridMode': 'Chiến dịch - Chế độ lưới',
      'campaignFreeMode': 'Chiến dịch - Chế độ tự do',
      'level': 'Cấp độ',
      
      // Màn hình cài đặt
      'volume': 'Âm lượng:',
      'music': 'Nhạc:',
      'language': 'Ngôn ngữ:',
      'end': 'Kết thúc',
      
      // Màn hình chơi
      'find': 'Tìm',
      'findNext': 'Tìm số tiếp theo!',
      'combo': 'Combo',
      'score': 'Điểm:',
      'time': 'Thời gian:',
      'correctAnswer': 'Đúng!',
      'wrongAnswer': 'Sai!',
      'timePenalty': '-3 giây',
      'bonusPoints': '+{0} điểm',
      
      // Màn hình kết quả
      'finish': 'Hoàn thành',
      'timeout': 'Hết giờ',
      'lifeout': 'Hết mạng',
      'usedTime': 'Thời gian sử dụng:',
      'timeRemaining': 'Thời gian còn lại:',
      'levelComplete': 'Cấp độ hoàn thành!',
      'newHighScore': 'Điểm cao mới!',
      
      // Thông báo xoay máy
      'rotateDevice': 'Vui lòng xoay thiết bị theo chiều ngang để có trải nghiệm tốt nhất',

      // Độ khó
      'difficultyEasy': 'Dễ',
      'difficultyNormal': 'Trung bình',
      'difficultyHard': 'Khó',
      'difficulty': 'Độ khó:',
      'selectDifficulty': 'Chọn độ khó:',
      'easyDescription': 'Dễ nhìn, thích hợp cho người mới',
      'normalDescription': 'Số đã chọn sẽ bị ẩn',
      'hardDescription': 'Nhiều số hơn, màu sắc đa dạng và hiệu ứng gây rối',
      'duplicateNumbersWarning': 'Cẩn thận! Có số nằm ngoài khoảng.',
    },
    en: {
      // Common
      'findSmallestNumber': 'Find the smallest number!',
      'play': 'Play',
      'settings': 'Settings',
      'back': '←',
      'exit': 'Exit',
      'replay': 'Replay',
      'continue': 'Continue',
      'start': 'Start',
      
      // Game mode screen
      'gameMode': 'Game Mode',
      'gridMode': 'Grid mode',
      'freeMode': 'Free mode',
      
      // Game mode detail screen
      'campaign': 'Campaign',
      'custom': 'Custom',
      'zenMode': 'Zen mode',
      
      // Custom screen
      'customGridMode': 'Custom - Grid mode',
      'customFreeMode': 'Custom - Free mode',
      'numberRange': 'Number Range:',
      'min': 'Min',
      'max': 'Max',
      'gridSize': 'Grid Size:',
      'maxNumbers': 'Max Numbers:',
      'timePerNumber': 'Time per Number:',
      'totalNumbers': 'Total Numbers:',
      'totalTime': 'Total Time:',
      'startGame': 'Start Game',
      
      // Campaign screen
      'campaignGridMode': 'Campaign - Grid Mode',
      'campaignFreeMode': 'Campaign - Free Mode',
      'level': 'Level',
      
      // Settings screen
      'volume': 'Volume:',
      'music': 'Music:',
      'language': 'Language:',
      'end': 'End',
      
      // Gameplay screen
      'find': 'Find',
      'findNext': 'Find the next number!',
      'combo': 'Combo',
      'score': 'Score:',
      'time': 'Time:',
      'correctAnswer': 'Correct!',
      'wrongAnswer': 'Wrong!',
      'timePenalty': '-3 seconds',
      'bonusPoints': '+{0} points',
      
      // Result screen
      'finish': 'Finish',
      'timeout': 'Time out',
      'lifeout': 'Life out',
      'usedTime': 'Used time:',
      'timeRemaining': 'Time remaining:',
      'levelComplete': 'Level Complete!',
      'newHighScore': 'New High Score!',
      
      // Rotate device notice
      'rotateDevice': 'Please rotate your device horizontally for the best experience',

      // Difficulty
      'difficultyEasy': 'Easy',
      'difficultyNormal': 'Normal',
      'difficultyHard': 'Hard',
      'difficulty': 'Difficulty:',
      'selectDifficulty': 'Select difficulty:',
      'easyDescription': 'Clear visibility, good for beginners',
      'normalDescription': 'Found numbers will be hidden',
      'hardDescription': 'More numbers, various colors and distractions',
      'duplicateNumbersWarning': 'Warning! Some numbers are out of range.',
    }
  };
  
  // Lấy ngôn ngữ từ local storage hoặc sử dụng tiếng Việt là mặc định
  let currentLanguage = localStorage.getItem('language') || 'vi';
  
  // Hàm lấy chuỗi dịch
  export const t = (key) => {
    const langData = translations[currentLanguage];
    return langData && langData[key] ? langData[key] : key;
  };
  
  // Hàm đổi ngôn ngữ
  export const setLanguage = (langCode) => {
    if (translations[langCode]) {
      currentLanguage = langCode;
      localStorage.setItem('language', langCode);
      return true;
    }
    return false;
  };
  
  // Hàm lấy ngôn ngữ hiện tại
  export const getCurrentLanguage = () => {
    return currentLanguage;
  };
  
  // Danh sách ngôn ngữ hỗ trợ
  export const SUPPORTED_LANGUAGES = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' }
  ];