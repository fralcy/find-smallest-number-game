// Enum/constant cho các mức độ khó
export const DIFFICULTY_LEVELS = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard'
  };
  
  // Màu sắc tương ứng với từng độ khó (dựa trên bảng màu của game)
  export const DIFFICULTY_COLORS = {
    [DIFFICULTY_LEVELS.EASY]: '#27AE60',   // Xanh lá (thành công) - phù hợp với theme hiện tại
    [DIFFICULTY_LEVELS.NORMAL]: '#F1C40F', // Vàng (chú ý) - phù hợp với theme hiện tại
    [DIFFICULTY_LEVELS.HARD]: '#E74C3C',   // Đỏ (cảnh báo) - phù hợp với theme hiện tại
  };
  
  // Thời gian giảm dần theo độ khó
  export const DIFFICULTY_TIME_MULTIPLIER = {
    [DIFFICULTY_LEVELS.EASY]: 1,     // Thời gian cơ bản
    [DIFFICULTY_LEVELS.NORMAL]: 0.8, // Giảm 20% thời gian
    [DIFFICULTY_LEVELS.HARD]: 0.6,   // Giảm 40% thời gian
  };
  
  // Điểm thưởng tăng dần theo độ khó
  export const DIFFICULTY_SCORE_MULTIPLIER = {
    [DIFFICULTY_LEVELS.EASY]: 1,     // Điểm cơ bản
    [DIFFICULTY_LEVELS.NORMAL]: 1.5, // Tăng 50% điểm
    [DIFFICULTY_LEVELS.HARD]: 2,     // Tăng 100% điểm
  };
  
  // Số lượng tối đa hiển thị đồng thời trong chế độ khó
  export const HARD_MODE_DISTRACTION_COUNT = 3; // Số lượng số làm xao nhãng thêm vào trong mode HARD