// Xử lý khi người chơi tìm đúng số
export const handleCorrectNumber = (
    number,
    state,
    mode,
    type,
    audioManager,
    settings
) => {
    // Phát âm thanh đúng
    audioManager.play("correct");

    const result = {
        score: state.score,
        foundNumbers: state.foundNumbers,
        numbersFound: state.numbersFound,
        gridNumbers: state.gridNumbers,
        freeNumbers: state.freeNumbers,
        targetNumber: state.targetNumber,
        gameComplete: false,
    };

    if (mode === "zen") {
        // Trong Zen mode, tăng điểm mỗi khi tìm đúng
        result.score = state.score + 10;

        // Sinh grid mới hoặc free numbers mới sẽ được xử lý ở component
        return result;
    }

    // Các mode khác
    result.foundNumbers = [...state.foundNumbers, number];
    const pointsForNumber = Math.ceil(state.timeLeft / 10);
    result.score = state.score + pointsForNumber;
    result.numbersFound = state.numbersFound + 1;

    // Kiểm tra nếu trò chơi hoàn thành
    if (type === "grid" && result.foundNumbers.length === state.gridNumbers.length) {
        result.gameComplete = true;
    } else if (
        type === "free" &&
        result.foundNumbers.length === state.freeNumbers.length
    ) {
        result.gameComplete = true;
    }

    return result;
};

// Xử lý khi người chơi chọn sai số
export const handleWrongNumber = (state, mode, audioManager) => {
    // Phát âm thanh sai
    audioManager.play("wrong");

    const result = {
        score: state.score,
        lives: state.lives,
    };

    if (mode === "zen") {
        // Giảm mạng trong zen mode
        result.lives = state.lives - 1;
    } else {
        // Giảm điểm trong các mode khác
        result.score = Math.max(0, state.score - 10);
    }

    return result;
};

// Xử lý khi trò chơi hoàn thành (thắng)
export const handleGameComplete = (
    state,
    settings,
    type,
    mode,
    level,
    audioManager,
    timeLeft
) => {
    // Phát âm thanh hoàn thành
    audioManager.play("win");

    // Tính toán kết quả trận đấu
    return {
        type,
        mode,
        outcome: "finish",
        score: state.score,
        usedTime: settings.totalTime - timeLeft,
        timeRemaining: timeLeft,
        level: mode === "campaign" ? level : undefined,
        stars: calculateStars(
            state.numbersFound,
            getTotalNumbers(type, settings),
            settings.totalTime - timeLeft,
            settings.totalTime
        ),
    };
};

// Xử lý khi hết thời gian
export const handleTimeout = (state, settings, type, mode, level, audioManager) => {
    // Phát âm thanh thất bại
    audioManager.play("lose");

    return {
        type,
        mode,
        outcome: "timeout",
        score: state.score,
        usedTime: settings.totalTime,
        timeRemaining: 0,
        level: mode === "campaign" ? level : undefined,
        stars: calculateStars(
            state.numbersFound,
            getTotalNumbers(type, settings),
            settings.totalTime,
            settings.totalTime
        ),
    };
};

// Xử lý khi hết mạng (chế độ zen)
export const handleLifeOut = (state, type, mode, audioManager) => {
    // Phát âm thanh thất bại
    audioManager.play("lose");

    return {
        type,
        mode,
        outcome: "lifeout",
        score: state.score,
        level: undefined,
        stars: undefined,
    };
};

// Helper function to calculate stars
const calculateStars = (numbersFound, totalNumbers, timeUsed, totalTime) => {
    const foundPercentage = (numbersFound / totalNumbers) * 100;
    const timePercentage = (timeUsed / totalTime) * 100;

    const performanceScore =
        foundPercentage * 0.7 + (100 - timePercentage) * 0.3;

    if (performanceScore > 80) return 3;
    if (performanceScore > 50) return 2;
    return 1;
};

// Helper function để lấy tổng số lượng số trong trò chơi
const getTotalNumbers = (type, settings) => {
    if (type === "grid") {
        return settings.gridSize * settings.gridSize;
    } else {
        return settings.maxNumbers;
    }
};