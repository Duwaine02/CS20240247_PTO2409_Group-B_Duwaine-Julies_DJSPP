import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { FavouritesContext } from './App';
import { AudioContext } from './context/AudioContext.jsx';
import { ListeningHistoryContext } from './context/ListeningHistoryContext.jsx';

export default function Favourites() {
  const { favourites, removeFromFavourites } = useContext(FavouritesContext);
  const { markAsListened } = useContext(ListeningHistoryContext);
  const { playEpisode } = useContext(AudioContext);
  const [sortOrder, setSortOrder] = useState('A-Z');

  const groupedFavourites = favourites.reduce((acc, item) => {
    const showKey = item.showTitle;
    const seasonKey = item.seasonTitle;
    if (!acc[showKey]) acc[showKey] = {};
    if (!acc[showKey][seasonKey]) acc[showKey][seasonKey] = [];
    acc[showKey][seasonKey].push(item);
    return acc;
  }, {});

  const sortEpisodes = (episodes) => {
    return [...episodes].sort((a, b) => {
      if (sortOrder === 'A-Z') return a.episodeTitle.localeCompare(b.episodeTitle);
      if (sortOrder === 'Z-A') return b.episodeTitle.localeCompare(a.episodeTitle);
      if (sortOrder === 'NEWEST_UPDATED') return new Date(b.addedAt) - new Date(a.addedAt);
      if (sortOrder === 'OLDEST_UPDATED') return new Date(a.addedAt) - new Date(b.addedAt);
      return 0;
    });
  };

  return (
    <div className="favourites-container">
      <h1 className="favourites-title">Favourites</h1>
      <div className="favourites-header">
        <div>
          <label htmlFor="sortOrder"><strong>Sort by:</strong></label>
          <select
            id="sortOrder"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
            aria-label="Sort favourites"
          >
            <option value="A-Z">A - Z</option>
            <option value="Z-A">Z - A</option>
            <option value="NEWEST_UPDATED">Newest Added</option>
            <option value="OLDEST_UPDATED">Oldest Added</option>
          </select>
        </div>
        <button
          className="reset-button"
          onClick={() => {
            if (window.confirm('Are you sure you want to reset all favourites?')) {
              removeFromFavourites();
            }
          }}
          aria-label="Reset favourites"
        >
          Reset Favourites
        </button>
        <button
          className="reset-button"
          onClick={(e) => {
            e.preventDefault();
            if (window.confirm('Are you sure you want to reset all listening history?')) {
              resetListeningHistory();
            }
          }}
          aria-label="Reset listening history"
        >
          Reset Listening History
        </button>
      </div>
      {Object.keys(groupedFavourites).length === 0 ? (
        <div className="centered-container">
          <p>No favourites added yet.</p>
        </div>
      ) : (
        Object.entries(groupedFavourites).map(([showTitle, seasons]) => (
          <div key={showTitle} className="show-group">
            <h2>{showTitle}</h2>
            {Object.entries(seasons).map(([seasonTitle, episodes]) => (
              <div key={seasonTitle} className="season-group">
                <h3>{seasonTitle}</h3>
                <ul className="episode-list">
                  {sortEpisodes(episodes).map((episode) => (
                    <li key={episode.episodeId} className="episode-card">
                      <div>
                        <strong>{episode.episodeTitle}</strong>
                        <p className="episode-date">Added: {episode.addedAt}</p>
                        <audio
                          controls
                          className="episode-audio"
                          src={episode.audioFile}
                          onPlay={() => playEpisode({
                            episodeId: episode.episodeId,
                            episodeTitle: episode.episodeTitle,
                            audioFile: episode.audioFile
                          })}
                          onEnded={() => markAsListened(episode.episodeId)}
                        >
                          <div className="progress-container">
                            <progress value="0" max="100" className="episode-progress" />
                          </div>
                        </audio>
                        <button
                          className="remove-button"
                          onClick={() => removeFromFavourites(episode.episodeId)}
                          aria-label={`Remove ${episode.episodeTitle} from favourites`}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))
      )}
      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
}