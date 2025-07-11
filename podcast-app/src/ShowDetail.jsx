import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FavouritesContext } from './App.jsx';
import { AudioContext } from './context/AudioContext.jsx';
import { ListeningHistoryContext } from './context/ListeningHistoryContext.jsx';

export default function ShowDetail() {
  const { id } = useParams();
  const { addToFavourites } = useContext(FavouritesContext);
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const { markAsListened } = useContext(ListeningHistoryContext);
  const { playEpisode } = useContext(AudioContext);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setShow(null);

    fetch(`https://podcast-api.netlify.app/id/${id}`, { signal: AbortSignal.timeout(10000) })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (!data || !data.title) throw new Error('Invalid show data');
        setShow(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load show details.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="centered-container">Loading show details...</div>;
  }

  if (error) {
    return (
      <div className="centered-container error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} aria-label="Retry loading show details">
          Retry
        </button>
      </div>
    );
  }

  if (!show) {
    return <div className="centered-container">No show data available.</div>;
  }

  const seasons = show.seasons || [];
  const season = seasons[selectedSeason] || null;

  if (!season) {
    return <div className="centered-container">No seasons available for this show.</div>;
  }

  return (
    <div className="show-detail-container">
      <h1 className="show-detail-title">{show.title}</h1>
      <p className="show-detail-description">{show.description}</p>
      <h2>Seasons</h2>
      <div className="show-detail-selector">
        <label><strong>Select Season:</strong></label>
        <select
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(parseInt(e.target.value, 10))}
          className="sort-select"
          aria-label="Select a season"
        >
          {seasons.map((seasonOption, index) => (
            <option key={seasonOption.id} value={index}>
              {seasonOption.title}
            </option>
          ))}
        </select>
      </div>
      <div className="season-card">
        <h3 className="season-title">{season.title}</h3>
        {season.description && (
          <p className="season-description">{season.description}</p>
        )}
        {season.image && (
          <img src={season.image} alt={season.title} className="season-image" />
        )}
        <p><strong>Number of Episodes:</strong> {season.episodes?.length || 0}</p>
        <ul className="episode-list">
          {season.episodes?.map((episode) => (
            <li key={episode.id} className="episode-card">
              <div>
                <strong>{episode.title}</strong>
                <audio
                  controls
                  className="episode-audio"
                  src={episode.file}
                  onPlay={() => playEpisode({
                    episodeId: episode.id,
                    episodeTitle: episode.title,
                    audioFile: episode.file
                  })}
                  onEnded={() => markAsListened(episode.id)}
                >
                  <div className="progress-container">
                    <progress value="0" max="100" className="episode-progress" />
                  </div>
                </audio>
                <button
                  className="add-favourite-button"
                  onClick={() => {
                    addToFavourites({
                      showId: show.id,
                      showTitle: show.title,
                      showDescription: show.description,
                      seasonId: season.id,
                      seasonTitle: season.title,
                      seasonDescription: season.description,
                      episodeId: episode.id,
                      episodeTitle: episode.title,
                      audioFile: episode.file,
                      addedAt: new Date().toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    });
                    alert('Added to favourites!');
                  }}
                  aria-label={`Add ${episode.title} to favourites`}
                >
                  Add to Favourites
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Link to="/" className="back-link">Back to Home</Link>
    </div>
  );
}