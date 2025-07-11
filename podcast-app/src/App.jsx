import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState, createContext, useEffect } from 'react';
import Home from './Home.jsx';
import ShowDetail from './ShowDetail.jsx';
import Favourites from './Favourites.jsx';
import './App.css';
import { AudioProvider } from './context/AudioContext.jsx';
import { ListeningHistoryProvider } from './context/ListeningHistoryContext.jsx';

export const FavouritesContext = createContext();

function App() {
  const [favourites, setFavourites] = useState([]);

  const addToFavourites = (item) => {
    setFavourites([...favourites, { ...item, id: item.episodeId }]);
  };

  const removeFromFavourites = (id) => {
    setFavourites((prev) => prev.filter((item) => item.episodeId !== id));
  };

  useEffect(() => {
    localStorage.setItem('favourites', JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    const saved = localStorage.getItem('favourites');
    if (saved) {
      setFavourites(JSON.parse(saved));
    }
  }, []);

  return (
    <FavouritesContext.Provider value={{ favourites, addToFavourites, removeFromFavourites }}>
      <ListeningHistoryProvider>
        <AudioProvider>
          <BrowserRouter>
            <div className="app-header">
              <h1>FuturePotential-FM</h1>
              <nav>
                <Link to="/">Home</Link> | <Link to="/favourites">Favourites</Link>
              </nav>
            </div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/show/:id" element={<ShowDetail />} />
              <Route path="/favourites" element={<Favourites />} />
            </Routes>
          </BrowserRouter>
        </AudioProvider>
      </ListeningHistoryProvider>
    </FavouritesContext.Provider>
  );
}

export default App;