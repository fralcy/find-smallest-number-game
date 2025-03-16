import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainScreen from './screens/MainScreen';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/game-mode" element={<div>Game Mode Selection (Coming Soon)</div>} />
        <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
}

export default App;