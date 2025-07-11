import { createContext, useState, useEffect } from 'react';

export const ListeningHistoryContext = createContext();

export const ListeningHistoryProvider = ({ children }) => {
  const [listenedEpisodes, setListenedEpisodes] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('listenedEpisodes');
    if (saved) {
      setListenedEpisodes(JSON.parse(saved));
    }
  }, []);

  const markAsListened = (episodeId) => {
    if (!listenedEpisodes.includes(episodeId)) {
      setListenedEpisodes([...listenedEpisodes, episodeId]);
    }
  };

  const resetListeningHistory = () => {
    if (window.confirm('Are you sure you want to reset all listening history?')) {
      setListenedEpisodes([]);
    }
  };

  useEffect(() => {
    localStorage.setItem('listenedEpisodes', JSON.stringify(listenedEpisodes));
  }, [listenedEpisodes]);

  return (
    <ListeningHistoryContext.Provider value={{ listenedEpisodes, markAsListened, resetListeningHistory }}>
      {children}
    </ListeningHistoryContext.Provider>
  );
};