/**
 * Các tiện ích để tạo và xử lý màu sắc cho game, đặc biệt ở chế độ khó
 */
import { DIFFICULTY_LEVELS } from '../constants/difficulty';

/**
 * Tạo màu HSL ngẫu nhiên để sử dụng cho các số trong chế độ khó
 * @param {number} saturationMin - Độ bão hòa tối thiểu (%)
 * @param {number} saturationMax - Độ bão hòa tối đa (%)
 * @param {number} lightnessMin - Độ sáng tối thiểu (%)
 * @param {number} lightnessMax - Độ sáng tối đa (%)
 * @returns {string} - Chuỗi màu HSL
 */
export const generateRandomColor = (
  saturationMin = 65,
  saturationMax = 85,
  lightnessMin = 75,
  lightnessMax = 90
) => {
  // Tạo hue ngẫu nhiên (0-360)
  const hue = Math.floor(Math.random() * 360);
  
  // Saturation và lightness ngẫu nhiên trong khoảng cho phép
  const saturation = Math.floor(
    Math.random() * (saturationMax - saturationMin) + saturationMin
  );
  const lightness = Math.floor(
    Math.random() * (lightnessMax - lightnessMin) + lightnessMin
  );
  
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
    const saturation = 70 + Math.floor(Math.random() * 20); // 70-90%
    const lightness = 75 + Math.floor(Math.random() * 15); // 75-90%
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
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
    case DIFFICULTY_LEVELS.EASY:
      return 'rgba(240, 240, 240, 1)'; // Rõ nhất
    case DIFFICULTY_LEVELS.NORMAL:
      return 'rgba(240, 240, 240, 0.9)'; // Hơi mờ
    case DIFFICULTY_LEVELS.HARD:
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
  // Với các màu HSL
  if (backgroundColor.includes('hsl')) {
    const matches = backgroundColor.match(/hsl\(\s*\d+\s*,\s*\d+%\s*,\s*(\d+)%\s*\)/);
    if (matches && matches[1]) {
      const lightness = parseInt(matches[1], 10);
      return lightness > 70 ? '#333' : 'white';
    }
  }
  
  // Với các màu RGB hoặc RGBA
  if (backgroundColor.includes('rgb')) {
    const matches = backgroundColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*[\d.]+)?\s*\)/);
    if (matches && matches[1] && matches[2] && matches[3]) {
      const r = parseInt(matches[1], 10);
      const g = parseInt(matches[2], 10);
      const b = parseInt(matches[3], 10);
      
      // Tính toán độ sáng theo công thức tiêu chuẩn
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#333' : 'white';
    }
  }
  
  // Mặc định trả về màu đen
  return '#333';
};

/**
 * Tạo màu gradient ngẫu nhiên cho chế độ hard
 * @returns {string} - CSS gradient string
 */
export const generateRandomGradient = () => {
  const color1 = generateRandomColor();
  const color2 = generateRandomColor();
  const angle = Math.floor(Math.random() * 360);
  
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
};

/**
 * Tạo hiệu ứng gợn sóng màu cho chế độ hard
 * @param {number} intensity - Độ mạnh của hiệu ứng (0-1)
 * @returns {string} - CSS radial gradient
 */
export const generateRippleEffect = (intensity = 0.3) => {
  const baseColor = generateRandomColor();
  const accentColor = generateRandomColor();
  
  return `radial-gradient(circle, ${baseColor} 0%, ${accentColor} 100%)`;
};

/**
 * Tạo text-shadow hiệu ứng dựa vào độ khó
 * @param {string} difficulty - Độ khó
 * @returns {string} - CSS text-shadow
 */
export const getTextShadowByDifficulty = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return '0 1px 2px rgba(0, 0, 0, 0.1)';
    case DIFFICULTY_LEVELS.NORMAL:
      return '0 1px 3px rgba(0, 0, 0, 0.2)';
    case DIFFICULTY_LEVELS.HARD:
      // Hiệu ứng text-shadow phức tạp hơn
      return `0 1px 2px rgba(0, 0, 0, 0.3), 
              0 2px 4px rgba(0, 0, 0, 0.2)`;
    default:
      return 'none';
  }
};