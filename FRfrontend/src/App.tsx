import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navigation from './components/Navigation';
import UploadPage from './pages/UploadPage';
import CameraPage from './pages/CameraPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navigation />
        <main>
          <Routes>
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/camera" element={<CameraPage />} />
            <Route path="/" element={<Navigate to="/upload" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
