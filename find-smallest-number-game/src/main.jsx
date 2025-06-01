import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { t, getCurrentLanguage, initLanguage } from './utils/languageUtils'
import { registerServiceWorker } from './pwa'

// Đảm bảo ngôn ngữ được khởi tạo ngay từ đầu
// HTML có lang="en" ban đầu cho SEO, nhưng sẽ được initLanguage() cập nhật dựa vào localStorage
initLanguage();

// Cập nhật tiêu đề trang theo ngôn ngữ
const updateDocumentTitle = () => {
  document.title = t('findSmallestNumber');
};

// Đặt tiêu đề ban đầu
updateDocumentTitle();

// Thêm một listener để cập nhật tiêu đề khi ngôn ngữ thay đổi
document.addEventListener('languageChanged', updateDocumentTitle);

// Đăng ký Service Worker cho PWA
registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)