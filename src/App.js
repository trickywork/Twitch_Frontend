import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const EMPTY_RESOURCES = { streams: [], videos: [], clips: [] };
const TAB_LABELS = {
  streams: 'Live streams',
  videos: 'Videos',
  clips: 'Clips',
};

function imageUrl(url, width = 480, height = 270) {
  if (!url) {
    return `https://picsum.photos/seed/twitch-fallback-${width}/480/270`;
  }

  return url
    .replace('%{width}', width)
    .replace('%{height}', height)
    .replace('{width}', width)
    .replace('{height}', height);
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function normalizeItem(item) {
  return {
    id: item.id ?? null,
    twitch_id: item.twitch_id || item.twitchId,
    title: item.title || 'Untitled stream',
    url: item.url || '',
    thumbnail_url: item.thumbnail_url || item.thumbnailUrl,
    broadcaster_name: item.broadcaster_name || item.broadcasterName || 'Unknown channel',
    game_id: item.game_id || item.gameId,
    item_type: item.item_type || item.type,
  };
}

function App() {
  const [games, setGames] = useState([]);
  const [resources, setResources] = useState(EMPTY_RESOURCES);
  const [favorites, setFavorites] = useState(EMPTY_RESOURCES);
  const [activeGame, setActiveGame] = useState(null);
  const [activeTab, setActiveTab] = useState('streams');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const favoriteIds = useMemo(() => {
    return new Set(Object.values(favorites).flat().map((item) => item.twitch_id));
  }, [favorites]);

  useEffect(() => {
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const [topGames, savedFavorites] = await Promise.all([
        apiRequest('/game'),
        apiRequest('/favorite'),
      ]);
      setGames(topGames || []);
      setFavorites(savedFavorites || EMPTY_RESOURCES);
      if (topGames?.[0]) {
        await loadGame(topGames[0]);
      }
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshFavorites() {
    const savedFavorites = await apiRequest('/favorite');
    setFavorites(savedFavorites || EMPTY_RESOURCES);
  }

  async function loadGame(game) {
    setLoading(true);
    setActiveGame(game);
    setNotice('');
    try {
      const data = await apiRequest(`/search?game_id=${encodeURIComponent(game.id)}`);
      setResources(data || EMPTY_RESOURCES);
      setActiveTab('streams');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function searchGames(event) {
    event.preventDefault();
    setLoading(true);
    setNotice('');
    try {
      const path = query.trim()
        ? `/game?game_name=${encodeURIComponent(query.trim())}`
        : '/game';
      const data = await apiRequest(path);
      setGames(data || []);
      if (data?.[0]) {
        await loadGame(data[0]);
      }
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecommendations() {
    setLoading(true);
    setNotice('');
    try {
      const data = await apiRequest('/recommendation');
      setResources(data || EMPTY_RESOURCES);
      setActiveGame({ name: 'Recommended for you' });
      setActiveTab('streams');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite(rawItem) {
    const item = normalizeItem(rawItem);
    try {
      if (favoriteIds.has(item.twitch_id)) {
        await apiRequest(`/favorite/${encodeURIComponent(item.twitch_id)}`, { method: 'DELETE' });
      } else {
        await apiRequest('/favorite', {
          method: 'POST',
          body: JSON.stringify(item),
        });
      }
      await refreshFavorites();
    } catch (error) {
      setNotice(error.message);
    }
  }

  const currentItems = resources[activeTab] || [];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <span className="brand-mark">tv</span>
          <div>
            <h1>Twitch Explorer</h1>
            <p>Streams, clips, videos, and saved picks.</p>
          </div>
        </div>

        <form className="search-form" onSubmit={searchGames}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games"
            aria-label="Search games"
          />
          <button type="submit">Search</button>
        </form>

        <button className="recommend-button" type="button" onClick={loadRecommendations}>
          Recommendations
        </button>

        <nav className="game-list" aria-label="Popular games">
          {games.map((game) => (
            <button
              className={`game-button ${activeGame?.id === game.id ? 'active' : ''}`}
              key={game.id}
              type="button"
              onClick={() => loadGame(game)}
            >
              <img src={imageUrl(game.box_art_url || game.boxArtUrl, 64, 64)} alt="" />
              <span>{game.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      <section className="content">
        <header className="content-header">
          <div>
            <p className="eyebrow">Portfolio demo</p>
            <h2>{activeGame?.name || 'Top games'}</h2>
          </div>
          <div className="status-pill">{loading ? 'Loading' : `${favoriteIds.size} saved`}</div>
        </header>

        {notice && <div className="notice">{notice}</div>}

        <div className="tabs" role="tablist" aria-label="Resource type">
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <button
              className={activeTab === key ? 'active' : ''}
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="item-grid">
          {currentItems.map((item) => {
            const normalized = normalizeItem(item);
            const isFavorite = favoriteIds.has(normalized.twitch_id);
            return (
              <article className="item-card" key={normalized.twitch_id}>
                <a href={normalized.url || '#'} target="_blank" rel="noreferrer">
                  <img src={imageUrl(normalized.thumbnail_url)} alt="" />
                </a>
                <div className="item-card-body">
                  <p>{normalized.broadcaster_name}</p>
                  <h3>{normalized.title}</h3>
                  <button type="button" onClick={() => toggleFavorite(normalized)}>
                    {isFavorite ? 'Saved' : 'Save'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {!loading && currentItems.length === 0 && (
          <div className="empty-state">Choose a game or run a search to load Twitch resources.</div>
        )}
      </section>
    </main>
  );
}

export default App;
