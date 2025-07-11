import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_URL = 'https://podcast-api.netlify.app';

export default function Home() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortOrder, setSortOrder] = useState('A-Z');
  const [searchTerm, setSearchTerm] = useState('');

  const GENRES = {
    1: "Personal Growth",
    2: "Investigative Journalism",
    3: "History",
    4: "Comedy",
    5: "Entertainment",
    6: "Business",
    7: "Fiction",
    8: "News",
    9: "Kids and Family",
  };

  const fetchShowDetails = async (showId) => {
    try {
      const response = await fetch(`${API_URL}/id/${showId}`, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`Failed to fetch details for show ${showId}`);
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`Error fetching details for show ${showId}:`, err);
      return { genreIds: [], seasons: [] }; // Fallback data
    }
  };

  const fetchShows = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      const showsArray = data.podcasts || data.shows || data;
      if (!Array.isArray(showsArray)) throw new Error('Shows data is not an array');
      
      // Fetch detailed data for each show
      const detailedShows = await Promise.all(showsArray.map(async (show) => {
        const detailedData = await fetchShowDetails(show.id);
        return {
          ...show,
          ...detailedData,
          updated: new Date().toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          genreIds: detailedData.genreIds || [],
          seasons: detailedData.seasons || []
        };
      }));
      setShows(detailedShows);
    } catch (err) {
      setError(err.message);
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  const toggleExpanded = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const sortedShows = [...shows].sort((a, b) => {
    if (sortOrder === 'A-Z') return a.title.localeCompare(b.title);
    if (sortOrder === 'Z-A') return b.title.localeCompare(a.title);
    if (sortOrder === 'NEWEST_UPDATED') return new Date(b.updated) - new Date(a.updated);
    if (sortOrder === 'OLDEST_UPDATED') return new Date(a.updated) - new Date(b.updated);
    return 0;
  });

  const filteredShows = sortedShows.filter(show => {
    const matchesGenre = selectedGenre === 'All' || (show.genreIds && show.genreIds.includes(Number(selectedGenre)));
    const matchesSearch = show.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  if (loading) {
    return (
      <div className="centered-container">
        <div className="loader"></div>
        <p>Loading shows...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="centered-container error">
        <p>Error: {error}</p>
        <button onClick={fetchShows}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">All Podcast Shows</h1>
      <div className="filter-container">
        <input
          type="text"
          placeholder="Search podcasts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <label htmlFor="genreFilter"><strong>Filter by Genre:</strong></label>
        <select
          id="genreFilter"
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
        >
          <option value="All">All Genres</option>
          {Object.entries(GENRES).map(([id, title]) => (
            <option key={id} value={id}>{title}</option>
          ))}
        </select>
        <label htmlFor="sortOrder"><strong>Sort by:</strong></label>
        <select
          id="sortOrder"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="sort-select"
        >
          <option value="A-Z">A - Z</option>
          <option value="Z-A">Z - A</option>
          <option value="NEWEST_UPDATED">Newest Updated</option>
          <option value="OLDEST_UPDATED">Oldest Updated</option>
        </select>
      </div>

      {filteredShows.length === 0 ? (
        <div className="centered-container">
          <p>No shows match this genre or search term.</p>
        </div>
      ) : (
        <div className="shows-grid">
          {filteredShows.map(show => {
            const isExpanded = expandedIds.includes(show.id);
            const MAX_LENGTH = 100;
            const shortDescription = show.description?.length > MAX_LENGTH
              ? show.description.slice(0, MAX_LENGTH) + '...'
              : show.description || 'No description available';

            return (
              <div
                key={show.id}
                className="show-card"
                tabIndex={0}
                aria-label={`Podcast: ${show.title}`}
              >
                <img
                  src={show.image}
                  alt={`Cover art for ${show.title}`}
                  className="show-image"
                  loading="lazy"
                />
                <h2 className="show-title">{show.title}</h2>
                <p className="show-description" style={{ wordWrap: 'break-word' }}>
                  {isExpanded ? show.description : shortDescription}
                </p>
                <button
                  onClick={() => toggleExpanded(show.id)}
                  className="toggle-btn"
                  aria-expanded={isExpanded}
                  aria-controls={`desc-${show.id}`}
                >
                  {isExpanded ? 'Show Less' : 'Read More'}
                </button>
                <p><strong>Genres:</strong> {show.genreIds.length > 0 ? show.genreIds.map(id => GENRES[id]).join(', ') : 'N/A'}</p>
                <p><strong>Seasons:</strong> {show.seasons.length}</p>
                <p><strong>Updated:</strong> {show.updated}</p>
                <Link to={`/show/${show.id}`} className="details-link">
                  View Details
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}