class AudioManager {
    constructor() {
      this.sounds = {};
      this.music = null;
      this.musicVolume = 0.5;
      this.soundVolume = 0.5;
      this.isMuted = false;
      this.loadSettings();
    }
  
    loadSettings() {
      try {
        const volumeStr = localStorage.getItem('volume');
        const musicStr = localStorage.getItem('music');
        if (volumeStr !== null) this.soundVolume = parseInt(volumeStr) / 100;
        if (musicStr !== null) this.musicVolume = parseInt(musicStr) / 100;
      } catch (error) {
        console.error('Error loading audio settings:', error);
      }
    }
  
    loadSounds() {
      // Chỉ 5 hiệu ứng âm thanh cơ bản
      this.load('button', './sounds/button.mp3');     // Nút và chuyển màn hình
      this.load('correct', './sounds/correct.mp3');   // Chọn đúng số
      this.load('wrong', './sounds/wrong.mp3');       // Chọn sai số
      this.load('win', './sounds/win.mp3');           // Thắng
      this.load('lose', './sounds/lose.mp3');         // Thua
    }
  
    // Tải một âm thanh
    load(name, path) {
      const sound = new Audio(path);
      sound.preload = 'auto';
      this.sounds[name] = sound;
      return sound;
    }
  
    // Phát nhạc nền
    playMusic(path) {
      if (this.music) {
        this.music.pause();
        this.music.currentTime = 0;
      }
  
      this.music = new Audio(path);
      this.music.loop = true;
      this.music.volume = this.musicVolume;
      
      if (!this.isMuted) {
        this.music.play().catch(e => console.log('Music autoplay prevented:', e));
      }
      
      return this.music;
    }
  
    // Phát hiệu ứng âm thanh
    play(name) {
      if (this.isMuted || !this.sounds[name]) return null;
      
      // Clone âm thanh để có thể phát nhiều lần đồng thời
      const sound = this.sounds[name].cloneNode();
      sound.volume = this.soundVolume;
      sound.play().catch(e => console.log(`Sound ${name} play prevented:`, e));
      
      return sound;
    }
  
    // Cập nhật âm lượng
    updateVolume(soundVolume, musicVolume) {
      this.soundVolume = soundVolume / 100;
      this.musicVolume = musicVolume / 100;
  
      if (this.music) {
        this.music.volume = this.musicVolume;
      }
    }
  
    // Tắt/bật âm thanh
    toggleMute() {
      this.isMuted = !this.isMuted;
      
      if (this.music) {
        if (this.isMuted) {
          this.music.pause();
        } else {
          this.music.play().catch(e => console.log('Music play prevented:', e));
        }
      }
      
      return this.isMuted;
    }
  
    // Dừng tất cả âm thanh
    stopAll() {
      if (this.music) {
        this.music.pause();
        this.music.currentTime = 0;
      }
      
      Object.values(this.sounds).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
      });
    }
  }
  
  // Export singleton
  export const audioManager = new AudioManager();
  export default audioManager;