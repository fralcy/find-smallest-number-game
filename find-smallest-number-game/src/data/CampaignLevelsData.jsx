import { DIFFICULTY_LEVELS } from '../constants/difficulty';

// Chế độ Grid, mức độ khó tăng dần
export const gridLevelsData = [
    {
      id: 1,
      minNumber: 1,
      maxNumber: 20,
      gridSize: 3,
      timePerNumber: 5,
      difficulty: DIFFICULTY_LEVELS.EASY  // Level 1-4: Dễ
    },
    {
      id: 2,
      minNumber: 1,
      maxNumber: 30,
      gridSize: 4,
      timePerNumber: 4,
      difficulty: DIFFICULTY_LEVELS.EASY
    },
    {
      id: 3,
      minNumber: 1,
      maxNumber: 50,
      gridSize: 4,
      timePerNumber: 3,
      difficulty: DIFFICULTY_LEVELS.EASY
    },
    {
      id: 4,
      minNumber: 1,
      maxNumber: 99,
      gridSize: 5,
      timePerNumber: 3,
      difficulty: DIFFICULTY_LEVELS.EASY
    },
    {
      id: 5,
      minNumber: 50,
      maxNumber: 200,
      gridSize: 5,
      timePerNumber: 2.5,
      difficulty: DIFFICULTY_LEVELS.NORMAL  // Level 5-8: Trung bình
    },
    {
      id: 6,
      minNumber: 100,
      maxNumber: 300,
      gridSize: 5,
      timePerNumber: 2.5,
      difficulty: DIFFICULTY_LEVELS.NORMAL
    },
    {
      id: 7,
      minNumber: 200,
      maxNumber: 500,
      gridSize: 6,
      timePerNumber: 2,
      difficulty: DIFFICULTY_LEVELS.NORMAL
    },
    {
      id: 8,
      minNumber: 500,
      maxNumber: 999,
      gridSize: 6,
      timePerNumber: 2,
      difficulty: DIFFICULTY_LEVELS.NORMAL
    },
    {
      id: 9,
      minNumber: 1000,
      maxNumber: 9999,
      gridSize: 6,
      timePerNumber: 1.5,
      difficulty: DIFFICULTY_LEVELS.HARD  // Level 9-10: Khó
    },
    {
      id: 10,
      minNumber: 1000,
      maxNumber: 9999,
      gridSize: 7,
      timePerNumber: 1.5,
      difficulty: DIFFICULTY_LEVELS.HARD
    }
  ];
  
  // Chế độ Free, mức độ khó tăng dần
  export const freeLevelsData = [
    {
      id: 1,
      minNumber: 1,
      maxNumber: 20,
      maxNumbers: 10,
      timePerNumber: 5,
      difficulty: DIFFICULTY_LEVELS.EASY  // Level 1-4: Dễ
    },
    {
      id: 2,
      minNumber: 1,
      maxNumber: 50,
      maxNumbers: 15,
      timePerNumber: 4,
      difficulty: DIFFICULTY_LEVELS.EASY
    },
    {
      id: 3,
      minNumber: 1,
      maxNumber: 99,
      maxNumbers: 15,
      timePerNumber: 3,
      difficulty: DIFFICULTY_LEVELS.EASY
    },
    {
      id: 4,
      minNumber: 10,
      maxNumber: 100,
      maxNumbers: 20,
      timePerNumber: 3,
      difficulty: DIFFICULTY_LEVELS.EASY
    },
    {
      id: 5,
      minNumber: 50,
      maxNumber: 200,
      maxNumbers: 20,
      timePerNumber: 2.5,
      difficulty: DIFFICULTY_LEVELS.NORMAL  // Level 5-8: Trung bình
    },
    {
      id: 6,
      minNumber: 100,
      maxNumber: 300,
      maxNumbers: 25,
      timePerNumber: 2.5,
      difficulty: DIFFICULTY_LEVELS.NORMAL
    },
    {
      id: 7,
      minNumber: 200,
      maxNumber: 500,
      maxNumbers: 25,
      timePerNumber: 2,
      difficulty: DIFFICULTY_LEVELS.NORMAL
    },
    {
      id: 8,
      minNumber: 500,
      maxNumber: 999,
      maxNumbers: 30,
      timePerNumber: 2,
      difficulty: DIFFICULTY_LEVELS.NORMAL
    },
    {
      id: 9,
      minNumber: 1000,
      maxNumber: 9999,
      maxNumbers: 30,
      timePerNumber: 1.5,
      difficulty: DIFFICULTY_LEVELS.HARD  // Level 9-10: Khó
    },
    {
      id: 10,
      minNumber: 1000,
      maxNumber: 9999,
      maxNumbers: 35,
      timePerNumber: 1.5,
      difficulty: DIFFICULTY_LEVELS.HARD
    }
  ];