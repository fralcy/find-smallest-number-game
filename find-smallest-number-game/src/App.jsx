import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';
import GameModeScreen from './screens/GameModeScreen';
import GameModeDetailScreen from './screens/GameModeDetailScreen';
import CampaignScreen from './screens/CampaignScreen';
import CustomScreen from './screens/CustomScreen';
import GameplayScreen from './screens/GameplayScreen';
import ResultScreen from './screens/ResultScreen';
import { GameProvider, useGameContext } from './contexts/GameContext';
import { setLanguage } from './utils/languageUtils';
import './App.css';

// Tạo component để khởi động AudioManager và cài đặt ngôn ngữ
const AppContent = () => {
  const { audioManager } = useGameContext();

  // Khởi tạo audio manager và ngôn ngữ khi app loads
  useEffect(() => {
    // Khôi phục cài đặt ngôn ngữ
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Mặc định là tiếng Việt
      setLanguage('vi');
      localStorage.setItem('language', 'vi');
    }

    // Đăng ký sự kiện để cho phép phát âm thanh trên tương tác người dùng đầu tiên
    const unlockAudio = () => {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      context.resume().then(() => {
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
      });
    };

    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, [audioManager]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/game-mode" element={<GameModeScreen />} />
        <Route path="/game-mode/:type" element={<GameModeDetailScreen />} />
        <Route path="/game/:type/campaign" element={<CampaignScreen />} />
        <Route path="/game/:type/custom" element={<CustomScreen />} />
        <Route path="/game/:type/:mode/play" element={<GameplayScreen />} />
        <Route path="/result" element={<ResultScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;