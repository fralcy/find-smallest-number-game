import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import MainScreen from './screens/MainScreen';
import SettingsScreen from './screens/SettingsScreen';
import GameModeScreen from './screens/GameModeScreen';
import GameModeDetailScreen from './screens/GameModeDetailScreen';
import CampaignScreen from './screens/CampaignScreen';
import CustomScreen from './screens/CustomScreen';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/game-mode" element={<GameModeScreen />} />
        <Route path="/game-mode/:type" element={<GameModeDetailScreen />} />
        <Route path="/game/:type/campaign" element={<CampaignScreen />} />
        <Route path="/game/:type/custom" element={<CustomScreen />} />
        {/* Redirect any unknown route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;