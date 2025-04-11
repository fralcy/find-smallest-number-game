/**
 * Các tiện ích để tạo và xử lý màu sắc cho game, đặc biệt ở chế độ khó
 */

/**
 * Tạo màu HSL ngẫu nhiên để sử dụng cho các số trong chế độ khó
 * @returns {string} - Chuỗi màu HSL
 */
export const generateRandomColor = () => {
    // Tạo hue ngẫu nhiên (0-360)
    const hue = Math.floor(Math.random() * 360);
    
    // Saturation và lightness cố định để dễ nhìn
    const saturation = 70; // %
    const lightness = 80; // %
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };
  
  /**
   * Tạo bảng màu đối lập để dễ phân biệt
   * @param {number} count - Số lượng màu cần tạo
   * @returns {string[]} - Mảng các màu HSL
   */
  export const generateContrastingColors = (count) => {
    const colors = [];
    const hueStep = 360 / count;
    
    for (let i = 0; i < count; i++) {
      const hue = Math.floor(i * hueStep);
      colors.push(`hsl(${hue}, 70%, 80%)`);
    }
    
    return colors;
  };
  
  /**
   * Tạo màu nền mờ dần dựa trên độ khó
   * @param {string} difficulty - Độ khó
   * @returns {string} - Màu nền với opacity phù hợp
   */
  export const getBackgroundColorByDifficulty = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'rgba(240, 240, 240, 1)'; // Rõ nhất
      case 'normal':
        return 'rgba(240, 240, 240, 0.9)'; // Hơi mờ
      case 'hard':
        return 'rgba(240, 240, 240, 0.8)'; // Mờ nhất
      default:
        return 'rgba(240, 240, 240, 1)';
    }
  };
  
  /**
   * Lấy màu chữ dựa trên màu nền để đảm bảo độ tương phản
   * @param {string} backgroundColor - Màu nền (HEX, RGB, HSL)
   * @returns {string} - Màu chữ nên dùng ('black' hoặc 'white')
   */
  export const getTextColorForBackground = (backgroundColor) => {
    // Đơn giản hóa: nếu là màu HSL, kiểm tra lightness
    if (backgroundColor.includes('hsl')) {
      const matches = backgroundColor.match(/hsl\(\s*\d+\s*,\s*\d+%\s*,\s*(\d+)%\s*\)/);
      if (matches && matches[1]) {
        const lightness = parseInt(matches[1]);
        return lightness > 60 ? '#333' : 'white';
      }
    }
    
    // Mặc định trả về màu đen
    return '#333';
  };