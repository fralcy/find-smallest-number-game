import { DIFFICULTY_LEVELS, DIFFICULTY_COLORS } from '../constants/difficulty';
import { t } from './languageUtils';

/**
 * Lấy tên hiển thị của độ khó theo ngôn ngữ hiện tại
 * @param {string} difficulty - Độ khó (từ DIFFICULTY_LEVELS)
 * @returns {string} - Tên hiển thị độ khó theo ngôn ngữ
 */
export const getDifficultyName = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return t('difficultyEasy');
    case DIFFICULTY_LEVELS.NORMAL:
      return t('difficultyNormal');
    case DIFFICULTY_LEVELS.HARD:
      return t('difficultyHard');
    default:
      return t('difficultyEasy');
  }
};

/**
 * Lấy mô tả chi tiết của độ khó theo ngôn ngữ hiện tại
 * @param {string} difficulty - Độ khó (từ DIFFICULTY_LEVELS)
 * @returns {string} - Mô tả độ khó theo ngôn ngữ
 */
export const getDifficultyDescription = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.EASY:
      return t('easyDescription');
    case DIFFICULTY_LEVELS.NORMAL:
      return t('normalDescription');
    case DIFFICULTY_LEVELS.HARD:
      return t('hardDescription');
    default:
      return '';
  }
};

/**
 * Lấy màu tương ứng với độ khó
 * @param {string} difficulty - Độ khó (từ DIFFICULTY_LEVELS)
 * @returns {string} - Mã màu HEX
 */
export const getDifficultyColor = (difficulty) => {
  return DIFFICULTY_COLORS[difficulty] || DIFFICULTY_COLORS[DIFFICULTY_LEVELS.EASY];
};

/**
 * Lấy độ khó dựa vào level trong campaign mode
 * @param {number} level - Level hiện tại
 * @returns {string} - Độ khó từ DIFFICULTY_LEVELS
 */
export const getDifficultyByLevel = (level) => {
  if (level <= 4) return DIFFICULTY_LEVELS.EASY;
  if (level <= 8) return DIFFICULTY_LEVELS.NORMAL;
  return DIFFICULTY_LEVELS.HARD;
};

/**
 * Tạo style CSS cho phần tử dựa vào độ khó
 * @param {string} difficulty - Độ khó (từ DIFFICULTY_LEVELS)
 * @returns {Object} - CSS style object
 */
export const getDifficultyStyle = (difficulty) => {
  const color = getDifficultyColor(difficulty);
  return {
    backgroundColor: color,
    color: '#FFFFFF',
    fontWeight: 'bold',
  };
};

/**
 * Tạo tên class CSS dựa vào độ khó
 * @param {string} difficulty - Độ khó (từ DIFFICULTY_LEVELS)
 * @returns {string} - Tên class
 */
export const getDifficultyClass = (difficulty) => {
  return difficulty || DIFFICULTY_LEVELS.EASY;
};