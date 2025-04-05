// Hàm khởi tạo dữ liệu cho chế độ Grid
export const generateGridNumbers = (settings, mode) => {
    const { minNumber, maxNumber, gridSize } = settings;
    const totalCells = gridSize * gridSize;

    if (mode === "zen") {
        // Tạo target number duy nhất
        const target =
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;

        // Tạo lưới số ngẫu nhiên không chứa target
        let numbers = [];
        while (numbers.length < totalCells - 1) {
            let num =
                Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
            if (num !== target) numbers.push(num);
        }

        // Chèn target vào vị trí ngẫu nhiên
        const targetIndex = Math.floor(Math.random() * totalCells);
        numbers.splice(targetIndex, 0, target);

        return { numbers, targetNumber: target };
    } else {
        // Các mode khác giữ số không trùng nhau
        const uniqueNumbers = new Set();
        while (uniqueNumbers.size < totalCells) {
            uniqueNumbers.add(
                Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
            );
        }
        const numbers = Array.from(uniqueNumbers);
        return { numbers, targetNumber: Math.min(...numbers) };
    }
};

// Hàm khởi tạo dữ liệu cho chế độ Free
export const generateFreeNumbers = (settings, mode) => {
    const { minNumber, maxNumber, maxNumbers } = settings;

    if (mode === "zen") {
        // Tạo target number duy nhất
        const target =
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;

        // Tạo danh sách số ngẫu nhiên không chứa target
        const numbersWithPosition = [];
        const minDistance = 10; // Khoảng cách tối thiểu giữa các số (%)

        while (numbersWithPosition.length < maxNumbers - 1) {
            let x, y, isValidPosition, value;

            do {
                x = Math.random() * 80 + 10; // Random x position (10% to 90%)
                y = Math.random() * 70 + 15; // Random y position (15% to 85%)

                // Kiểm tra khoảng cách với các số đã tạo
                isValidPosition = numbersWithPosition.every((num) => {
                    const distance = Math.sqrt(
                        Math.pow(num.x - x, 2) + Math.pow(num.y - y, 2)
                    );
                    return distance >= minDistance;
                });

                // Chỉ lấy số nếu khác target
                if (isValidPosition) {
                    value =
                        Math.floor(Math.random() * (maxNumber - minNumber + 1)) +
                        minNumber;
                    if (value !== target) break;
                }
            } while (true);

            numbersWithPosition.push({ value, x, y });
        }

        // Chèn target vào vị trí ngẫu nhiên
        const targetIndex = Math.floor(Math.random() * maxNumbers);
        numbersWithPosition.splice(targetIndex, 0, {
            value: target,
            x: Math.random() * 80 + 10,
            y: Math.random() * 70 + 15,
        });

        return { numbers: numbersWithPosition, targetNumber: target };
    } else {
        // Các mode khác - tạo số không trùng nhau
        const uniqueNumbers = new Set();
        while (uniqueNumbers.size < maxNumbers) {
            uniqueNumbers.add(
                Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
            );
        }

        const numbersWithPosition = [];
        const minDistance = 10; // Khoảng cách tối thiểu giữa các số (%)

        Array.from(uniqueNumbers).forEach((value) => {
            let x, y, isValidPosition;

            do {
                x = Math.random() * 80 + 10; // Random x position (10% to 90%)
                y = Math.random() * 70 + 15; // Random y position (15% to 85%)

                // Kiểm tra khoảng cách với các số đã tạo
                isValidPosition = numbersWithPosition.every((num) => {
                    const distance = Math.sqrt(
                        Math.pow(num.x - x, 2) + Math.pow(num.y - y, 2)
                    );
                    return distance >= minDistance;
                });
            } while (!isValidPosition);

            numbersWithPosition.push({ value, x, y });
        });

        const smallestNumber = Math.min(...Array.from(uniqueNumbers));
        return { numbers: numbersWithPosition, targetNumber: smallestNumber };
    }
};

// Xáo trộn vị trí các số trong grid
export const shuffleGridNumbers = (gridNumbers) => {
    const shuffled = [...gridNumbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// Xáo trộn vị trí các số trong chế độ free
export const shuffleFreeNumbers = (freeNumbers) => {
    // Clone mảng hiện tại
    const shuffled = [...freeNumbers];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Cập nhật vị trí ngẫu nhiên mới cho từng số
    const minDistance = 10; // Khoảng cách tối thiểu giữa các số (đơn vị: %)
    shuffled.forEach((num) => {
        let x, y, isValidPosition;

        do {
            x = Math.random() * 80 + 10; // Random x position (10% to 90%)
            y = Math.random() * 70 + 15; // Random y position (15% to 85%)

            // Kiểm tra khoảng cách với các số đã tạo
            isValidPosition = shuffled.every((otherNum) => {
                if (otherNum === num) return true; // Không so sánh với chính nó
                const distance = Math.sqrt(
                    Math.pow(otherNum.x - x, 2) + Math.pow(otherNum.y - y, 2)
                );
                return distance >= minDistance;
            });
        } while (!isValidPosition);

        num.x = x;
        num.y = y;
    });

    return shuffled;
};

// Cập nhật số cần tìm (số nhỏ nhất trong các số còn lại)
export const getNextTargetNumber = (numbers, foundNumbers, mode, type) => {
    if (type === "grid") {
        // Với Zen mode, đơn giản chỉ tìm số nhỏ nhất trong mảng hiện tại
        if (mode === "zen") {
            return Math.min(...numbers);
        }

        // Các mode khác - lọc ra số chưa tìm thấy
        const remainingNumbers = numbers.filter(
            (num) => !foundNumbers.includes(num)
        );

        if (remainingNumbers.length === 0) {
            return null; // All numbers found, game complete
        }

        // Find the smallest remaining number
        return Math.min(...remainingNumbers);
    } else {
        // Free mode - lọc theo giá trị
        const remainingNumbers = numbers
            .map((item) => item.value)
            .filter((num) => !foundNumbers.includes(num));

        if (remainingNumbers.length === 0) {
            return null; // All numbers found, game complete
        }

        // Find the smallest remaining number
        return Math.min(...remainingNumbers);
    }
};

// Thay thế số đã tìm thấy bằng một số mới (cho Zen mode)
export const replaceFoundNumber = (gridNumbers, targetNumber, settings) => {
    const { minNumber, maxNumber } = settings;

    // Tạo số cần tìm mới
    let newTargetNumber;
    do {
        newTargetNumber =
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    } while (newTargetNumber === targetNumber); // Đảm bảo số mới khác số cần tìm hiện tại

    // Tìm và thay thế số cũ bằng một số mới
    let newNumber;
    do {
        newNumber =
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
    } while (newNumber === targetNumber || newNumber === newTargetNumber); // Đảm bảo số mới khác số cũ và số cần tìm mới

    // Tạo mảng mới từ mảng cũ
    const newGridNumbers = [...gridNumbers];

    // Thay thế số tại vị trí của số đã tìm thấy
    const indexToReplace = gridNumbers.indexOf(targetNumber);
    if (indexToReplace !== -1) {
        newGridNumbers[indexToReplace] = newNumber;
    }

    // Đặt số cần tìm mới ở một vị trí ngẫu nhiên
    const targetIndex = Math.floor(Math.random() * newGridNumbers.length);
    newGridNumbers[targetIndex] = newTargetNumber;

    return { newNumbers: newGridNumbers, newTargetNumber };
};

// Tính số sao dựa trên hiệu suất
export const calculateStars = (
    numbersFound,
    totalNumbers,
    timeUsed,
    totalTime
) => {
    const foundPercentage = (numbersFound / totalNumbers) * 100; // Tỷ lệ số đã tìm thấy
    const timePercentage = (timeUsed / totalTime) * 100; // Tỷ lệ thời gian đã sử dụng

    // Kết hợp tỷ lệ số đã tìm thấy và thời gian đã sử dụng
    const performanceScore =
        foundPercentage * 0.7 + (100 - timePercentage) * 0.3;

    if (performanceScore > 80) return 3; // Hiệu suất cao
    if (performanceScore > 50) return 2; // Hiệu suất trung bình
    return 1; // Hiệu suất thấp
};

// Xác định độ khó dựa vào level hoặc settings
export const getDifficulty = (mode, levelId = null) => {
    if (mode === "campaign" && levelId) {
        if (levelId <= 3) return "easy";
        if (levelId <= 7) return "normal";
        return "hard";
    }
    return mode === "zen" ? "hard" : "normal"; // Zen mode luôn khó
};

// Format time display (mm:ss)
export const formatTime = (seconds) => {
    if (seconds <= 0) return "00:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
        remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}`;
};