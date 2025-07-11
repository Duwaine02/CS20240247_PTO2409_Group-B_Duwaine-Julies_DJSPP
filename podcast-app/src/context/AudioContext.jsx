import { createContext, useState, useEffect, useRef } from 'react';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100 || 0;
        setProgress(progress);
      }
    });

    const handleBeforeUnload = (e) => {
      if (isPlaying) {
        e.preventDefault();
        e.returnValue = 'Audio is playing. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      audio.pause();
    };
  }, [isPlaying]);

  const playEpisode = (episode) => {
    const audio = audioRef.current;
    if (currentEpisode?.episodeId === episode.episodeId) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().catch(err => console.error('Playback failed:', err));
        setIsPlaying(true);
      }
    } else {
      audio.src = episode.audioFile || episode.file;
      audio.play().catch(err => console.error('Playback failed:', err));
      setCurrentEpisode(episode);
      setIsPlaying(true);
    }
  };

  const stopEpisode = () => {
    audioRef.current.pause();
    setIsPlaying(false);
    setCurrentEpisode(null);
  };

  return (
    <AudioContext.Provider value={{ currentEpisode, playEpisode, stopEpisode, isPlaying, progress }}>
      {children}
      {currentEpisode && (
        <div style={{ position: 'fixed', bottom: 0, width: '100%', background: '#1a1a1a', padding: '0.5rem', color: 'white' }}>
          <p>Playing: {currentEpisode.episodeTitle}</p>
          <audio
            ref={audioRef}
            controls
            style={{ width: '100%' }}
            onEnded={() => setIsPlaying(false)}
          />
          <progress value={progress} max="100" style={{ width: '100%' }} />
          <button onClick={stopEpisode} style={{ marginTop: '0.5rem' }}>Stop</button>
        </div>
      )}
    </AudioContext.Provider>
  );
};