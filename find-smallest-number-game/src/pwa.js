export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker đăng ký thành công:', registration);
        })
        .catch((error) => {
          console.log('Lỗi đăng ký Service Worker:', error);
        });
    });
  }
}