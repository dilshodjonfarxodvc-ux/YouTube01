import { useEffect, useState } from 'react'
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
  useSearchParams,
  useLocation
} from 'react-router-dom'
import './App.css'
 
/* ------------------------------------------------------------------ */
/*  SOZLAMA (ixtiyoriy): .env faylga                                   */
/*  VITE_YT_API_KEY=sizning_kalitingiz                                 */
/*  Kalit bo'lsa, qidiruv va Home to'g'ridan-to'g'ri YouTube'dan keladi */
/* ------------------------------------------------------------------ */
const API_KEY = import.meta.env.VITE_YT_API_KEY
const API = 'https://www.googleapis.com/youtube/v3'
 
// Kalitsiz qidiruv uchun ochiq Piped serverlari (biri ishlamasa, boshqasi sinaladi)
const PIPED = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.adminforge.de',
  'https://api.piped.private.coffee',
  'https://pipedapi.leptons.xyz'
]
 
const thumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
 
/* ------------------------- Mahalliy videolar ----------------------- */
/* mk(id, sarlavha, kanal, kategoriya, qidiruv so'zlari, ko'rishlar, davomiylik)
   id = YouTube video ID (youtube.com/watch?v= dan keyingi qism).
   Yangi video qo'shish uchun shunchaki yangi mk(...) qatorini yozing. */
const mk = (id, title, channel, category, tags = '', views = '', duration = '') => ({
  id,
  title,
  channel,
  category,
  tags,
  views,
  date: '',
  duration,
  description: `${channel} kanalidan video.`
})
 
const FB = 'football futbol soccer sport goals gol'
const VB = 'volleyball voleybol sport vnl nations league'
const MV = 'movies movie film kino trailer'
const IT = 'it programming dasturlash coding tutorial course'
const MU = 'music musiqa qoshiq song'
 
const localVideos = [
  /* Football */
  mk('xoungdAL15U', 'HIGHLIGHTS | Real Madrid 4-1 Rayo Vallecano | LaLiga', 'LaLiga', 'Football', FB + ' real madrid'),
  mk('y-J_ZKFyWX8', 'HIGHLIGHTS | Real Madrid 4-0 Málaga CF | LaLiga', 'LaLiga', 'Football', FB + ' real madrid'),
  mk('xssDr9wNr_8', 'HIGHLIGHTS | Real Madrid 4-1 Real Sociedad | LaLiga', 'LaLiga', 'Football', FB + ' real madrid'),
  mk('y_R601Sg11k', 'HIGHLIGHTS | Real Madrid 2-0 Espanyol | LaLiga', 'LaLiga', 'Football', FB + ' real madrid'),
  mk('txOmBkBnsEc', 'The BEST Real Madrid Goals Of ALL TIME!', 'YouTube', 'Football', FB + ' real madrid champions league'),
  mk('HU0XQyyuKWM', 'Atlético Madrid vs Real Madrid 2-1', 'YouTube', 'Football', FB + ' real madrid atletico derby'),
  mk('ADEMvU1Uff4', 'BEST FOOTBALL Highlights EVER! Goals, Skills & Lightning Strikes', 'Lightening Goals', 'Football', FB + ' skills'),
  mk('pn5AQvgZZWk', 'Gol Figueroa - Brasileiro 75 - final Inter x Cruzeiro', 'YouTube', 'Football', FB + ' brasil'),
 
  /* Volleyball */
  mk('SAjrSUNCQbc', "USA vs. Poland - Gold Match | Highlights | Men's VNL 2026 - Final", 'Volleyball World', 'Volleyball', VB),
  mk('8DLEBg-PZUc', 'NED vs. USA - Highlights Week 1', 'Volleyball World', 'Volleyball', VB),
  mk('sRU-nmpw2Qo', 'USA vs. JPN - Highlights Quarter Finals', 'Volleyball World', 'Volleyball', VB),
  mk('_N3P8VOLGew', 'FIVB Nations League Volleyball Highlights: Canada vs. U.S.', 'YouTube', 'Volleyball', VB),
 
  /* Movies */
  mk('qQd6qfua9tc', 'THE AWAKENING Official Trailer (2026)', 'Well Go USA Entertainment', 'Movies', MV + ' horror'),
  mk('rOz2DrOcTpI', 'NEW MOVIE TRAILERS 2026 & 2027 (Action) 4K ULTRA HD', 'YouTube', 'Movies', MV + ' action'),
  mk('p8Hdm2u17Z4', 'NEW MOVIE TRAILERS (2026 - 2027) 4K UHD', 'YouTube', 'Movies', MV),
  mk('-gtQKQTmFOg', 'NEW MOVIE TRAILERS 2026 & 2027', 'YouTube', 'Movies', MV),
  mk('fJWSvYzKlMg', 'ANIMALS Official Trailer (NEW 2026)', 'YouTube', 'Movies', MV),
 
  /* IT */
  mk('SqcY0GlETPk', 'React Tutorial for Beginners', 'Programming with Mosh', 'IT', IT + ' react', '3.5M', '1:21:48'),
  mk('w7ejDZ8SWv8', 'React JS Crash Course', 'Traversy Media', 'IT', IT + ' react', '2.1M', '1:48:06'),
  mk('bMknfKXIFA8', 'React Course - Beginner’s Tutorial for React JavaScript Library', 'freeCodeCamp.org', 'IT', IT + ' react javascript'),
  mk('rfscVS0vtbw', 'Learn Python - Full Course for Beginners', 'freeCodeCamp.org', 'IT', IT + ' python'),
  mk('kqtD5dpn9C8', 'Python for Beginners - Learn Python in 1 Hour', 'Programming with Mosh', 'IT', IT + ' python'),
  mk('PkZNo7MFNFg', 'Learn JavaScript - Full Course for Beginners', 'freeCodeCamp.org', 'IT', IT + ' javascript'),
  mk('pQN-pnXPaVg', 'HTML Full Course - Build a Website Tutorial', 'freeCodeCamp.org', 'IT', IT + ' html web'),
  mk('UB1O30fR-EE', 'HTML Crash Course For Absolute Beginners', 'Traversy Media', 'IT', IT + ' html web'),
  mk('yfoY53QXEnI', 'CSS Crash Course For Absolute Beginners', 'Traversy Media', 'IT', IT + ' css web'),
 
  /* Music */
  mk('dQw4w9WgXcQ', 'Rick Astley - Never Gonna Give You Up', 'Rick Astley', 'Music', MU, '1.5B', '3:33'),
  mk('kJQP7kiw5Fk', 'Luis Fonsi - Despacito ft. Daddy Yankee', 'Luis Fonsi', 'Music', MU, '8.3B', '4:42'),
  mk('RgKAFK5djSk', 'Wiz Khalifa - See You Again ft. Charlie Puth', 'Wiz Khalifa', 'Music', MU, '6.1B', '3:57'),
  mk('OPf0YbXqDm0', 'Mark Ronson - Uptown Funk ft. Bruno Mars', 'Mark Ronson', 'Music', MU, '5.2B', '4:30'),
  mk('JGwWNGJdvx8', 'Ed Sheeran - Shape of You', 'Ed Sheeran', 'Music', MU, '6.4B', '4:24'),
  mk('2Vv-BfVoq4g', 'Ed Sheeran - Perfect', 'Ed Sheeran', 'Music', MU),
  mk('fJ9rUzIMcZQ', 'Queen - Bohemian Rhapsody', 'Queen Official', 'Music', MU, '1.7B', '5:55'),
  mk('60ItHLz5WEA', 'Alan Walker - Faded', 'Alan Walker', 'Music', MU, '3.6B', '3:32'),
  mk('hT_nvWreIhg', 'OneRepublic - Counting Stars', 'OneRepublic', 'Music', MU, '4.7B', '4:43'),
  mk('YQHsXMglC9A', 'Adele - Hello', 'Adele', 'Music', MU),
  mk('hLQl3WQQoQ0', 'Adele - Someone Like You', 'Adele', 'Music', MU),
  mk('ZbZSe6N_BXs', 'Pharrell Williams - Happy', 'Pharrell Williams', 'Music', MU),
  mk('kXYiU_JCYtU', 'Linkin Park - Numb', 'Linkin Park', 'Music', MU),
  mk('eVTXPUF4Oz4', 'Linkin Park - In The End', 'Linkin Park', 'Music', MU),
  mk('nfWlot6h_JM', 'Taylor Swift - Shake It Off', 'Taylor Swift', 'Music', MU),
 
  /* Entertainment */
  mk('9bZkp7q19f0', 'PSY - GANGNAM STYLE', 'officialpsy', 'Entertainment', 'entertainment funny', '5.5B', '4:13'),
  mk('jNQXAC9IVRw', 'Me at the zoo', 'jawed', 'Entertainment', 'entertainment first youtube video', '360M', '0:19'),
  mk('L_jWHffIx5E', 'Smash Mouth - All Star', 'Smash Mouth', 'Entertainment', 'entertainment music meme'),
  mk('FTQbiNvZqaY', 'Toto - Africa', 'Toto', 'Entertainment', 'entertainment music classic'),
  mk('y6120QOlsfU', 'Darude - Sandstorm', 'Darude', 'Entertainment', 'entertainment music meme')
]
 
const categories = ['All', 'Football', 'Sport', 'Live', 'Music', 'Movies', 'Volleyball', 'Podcasts', 'IT']
 
const menuItems = [
  { icon: '🏠', title: 'Home', path: '/' },
  { icon: '🎬', title: 'Shorts', path: '/shorts' },
  { icon: '📺', title: 'Subscriptions', path: '/subscriptions' },
  { icon: '🕘', title: 'History', path: '/history' }
]
 
/* ----------------------------- Yordamchilar ------------------------ */
const cache = new Map()
localVideos.forEach(v => cache.set(v.id, { ...v, image: thumb(v.id) }))
const videos = localVideos.map(v => cache.get(v.id))
 
function readStore(key, initial) {
  try {
    const s = localStorage.getItem(key)
    return s ? JSON.parse(s) : initial
  } catch {
    return initial
  }
}
 
function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
 
function useStored(key, initial) {
  const [value, setValue] = useState(() => readStore(key, initial))
  useEffect(() => writeStore(key, value), [key, value])
  return [value, setValue]
}
 
function formatNumber(n) {
  n = Number(n)
  if (!n) return ''
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.0', '') + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace('.0', '') + 'K'
  return String(n)
}
 
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60]
  ]
  for (const [name, sec] of units) {
    const n = Math.floor(diff / sec)
    if (n >= 1) return `${n} ${name}${n > 1 ? 's' : ''} ago`
  }
  return 'just now'
}
 
const pad = n => String(n).padStart(2, '0')
 
function parseDuration(iso = '') {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return ''
  const [h, min, s] = [m[1] || 0, m[2] || 0, m[3] || 0].map(Number)
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`
}
 
function fmtSeconds(total) {
  total = Number(total)
  if (!total || total < 0) return ''
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
 
/* ------------------------ Rasmiy YouTube API ----------------------- */
function normalize(item) {
  const v = {
    id: item.id,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    views: formatNumber(item.statistics?.viewCount),
    likes: formatNumber(item.statistics?.likeCount),
    date: timeAgo(item.snippet.publishedAt),
    duration: parseDuration(item.contentDetails?.duration),
    image: item.snippet.thumbnails?.high?.url || thumb(item.id),
    description: item.snippet.description
  }
  cache.set(v.id, v)
  return v
}
 
async function api(path) {
  const res = await fetch(`${API}/${path}&key=${API_KEY}`)
  if (!res.ok) throw new Error('API error')
  return res.json()
}
 
async function fetchByIds(ids) {
  if (!ids.length) return []
  const data = await api(`videos?part=snippet,statistics,contentDetails&id=${ids.join(',')}`)
  return data.items.map(normalize)
}
 
async function searchVideos(q) {
  const data = await api(
    `search?part=snippet&type=video&videoEmbeddable=true&maxResults=24&q=${encodeURIComponent(q)}`
  )
  return fetchByIds(data.items.map(i => i.id.videoId))
}
 
async function popularVideos() {
  const data = await api(
    'videos?part=snippet,statistics,contentDetails&chart=mostPopular&maxResults=24&regionCode=UZ'
  )
  return data.items.map(normalize)
}
 
/* ------------------- Kalitsiz qidiruv (Piped) ---------------------- */
async function fetchJson(url, ms = 7000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error('bad response')
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}
 
function normalizePiped(i) {
  const id = i.url.split('v=')[1].split('&')[0]
  const v = {
    id,
    title: i.title,
    channel: i.uploaderName || 'YouTube',
    views: formatNumber(i.views),
    date: i.uploadedDate || '',
    duration: fmtSeconds(i.duration),
    image: thumb(id),
    description: i.shortDescription || ''
  }
  cache.set(id, v)
  return v
}
 
// Barcha serverga parallel so'rov yuboradi, birinchi ishlagani yutadi
function pipedSearch(q) {
  return Promise.any(
    PIPED.map(async base => {
      const data = await fetchJson(`${base}/search?q=${encodeURIComponent(q)}&filter=videos`)
      const items = (data.items || []).filter(
        i => i.type === 'stream' && i.url?.includes('v=') && !i.isShort
      )
      if (!items.length) throw new Error('empty')
      return items.map(normalizePiped)
    })
  )
}
 
/* ---------------------- Mahalliy qidiruv --------------------------- */
const synonyms = {
  futbol: 'football',
  voleybol: 'volleyball',
  volleybol: 'volleyball',
  kino: 'movies',
  film: 'movies',
  filmlar: 'movies',
  musiqa: 'music',
  qoshiq: 'music',
  dasturlash: 'it'
}
 
function localSearch(q) {
  const tokens = q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(t => synonyms[t] || t)
 
  if (!tokens.length) return videos
 
  return videos.filter(v => {
    const hay = `${v.title} ${v.channel} ${v.category} ${v.tags || ''}`.toLowerCase()
    return tokens.every(t => hay.includes(t))
  })
}
 
/* --------------------------- Ma'lumot hook ------------------------- */
function useVideoList(kind, query = '') {
  const [state, setState] = useState({ list: [], loading: true, more: false })
 
  useEffect(() => {
    let cancelled = false
 
    async function load() {
      // HOME
      if (kind === 'home') {
        if (API_KEY) {
          try {
            const list = await popularVideos()
            if (!cancelled) setState({ list: [...list, ...videos], loading: false, more: false })
            return
          } catch {
            /* mahalliyga qaytamiz */
          }
        }
        if (!cancelled) setState({ list: videos, loading: false, more: false })
        return
      }
 
      // SEARCH: avval mahalliy natijalar darhol, keyin real qidiruv qo'shiladi
      const local = localSearch(query)
      setState({ list: local, loading: local.length === 0, more: true })
 
      let remote = []
      try {
        remote = API_KEY ? await searchVideos(query) : await pipedSearch(query)
      } catch {
        if (API_KEY) {
          try {
            remote = await pipedSearch(query)
          } catch {
            /* ignore */
          }
        }
      }
 
      if (cancelled) return
      const ids = new Set(local.map(v => v.id))
      setState({
        list: [...local, ...remote.filter(v => !ids.has(v.id))],
        loading: false,
        more: false
      })
    }
 
    load()
    return () => {
      cancelled = true
    }
  }, [kind, query])
 
  return state
}
 
function addToHistory(v) {
  const item = {
    id: v.id,
    title: v.title,
    channel: v.channel,
    views: v.views,
    date: v.date,
    duration: v.duration,
    image: v.image || thumb(v.id)
  }
  const list = readStore('yt-history', []).filter(x => x.id !== v.id)
  writeStore('yt-history', [item, ...list].slice(0, 50))
}
 
/* ------------------------------ Header ----------------------------- */
function Header({ setMenu }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') || '')
 
  useEffect(() => {
    setSearch(params.get('q') || '')
  }, [params])
 
  function submitSearch(e) {
    e.preventDefault()
    if (!search.trim()) return
    navigate(`/search?q=${encodeURIComponent(search.trim())}`)
  }
 
  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={() => setMenu(prev => !prev)}>
          ☰
        </button>
        <Link to="/" className="logo">
          <span className="logo-icon">▶</span>
          <span>YouTube</span>
        </Link>
      </div>
 
      <form className="search-box" onSubmit={submitSearch}>
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>
 
      <div className="header-right">
        <button className="header-button">🎤</button>
        <button className="header-button">⊞</button>
        <button className="header-button">🔔</button>
        <div className="profile">L</div>
      </div>
    </header>
  )
}
 
/* ----------------------------- Sidebar ----------------------------- */
function Sidebar({ menu, setMenu }) {
  const { pathname } = useLocation()
  const close = () => setMenu(false)
 
  return (
    <aside className={`sidebar ${menu ? 'show' : ''}`}>
      {menuItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          onClick={close}
          className={`sidebar-item ${pathname === item.path ? 'active' : ''}`}
        >
          <span>{item.icon}</span>
          <span>{item.title}</span>
        </Link>
      ))}
 
      <div className="sidebar-line" />
      <h3>More from YouTube</h3>
 
      <a className="sidebar-item" href="https://www.youtube.com/premium" target="_blank" rel="noreferrer">
        <span>▶️</span>
        <span>YouTube Premium</span>
      </a>
      <a className="sidebar-item" href="https://music.youtube.com" target="_blank" rel="noreferrer">
        <span>🎵</span>
        <span>YouTube Music</span>
      </a>
      <a className="sidebar-item" href="https://www.youtube.com/gaming" target="_blank" rel="noreferrer">
        <span>🎮</span>
        <span>YouTube Gaming</span>
      </a>
    </aside>
  )
}
 
/* --------------------------- Categories ---------------------------- */
function Categories() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const q = params.get('q')
 
  const active = pathname === '/' ? 'All' : q
 
  function selectCategory(category) {
    if (category === 'All') return navigate('/')
    navigate(`/search?q=${encodeURIComponent(category)}`)
  }
 
  return (
    <div className="categories">
      {categories.map(category => (
        <button
          key={category}
          className={category === active ? 'category active' : 'category'}
          onClick={() => selectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
 
/* ---------------------------- Video card --------------------------- */
function VideoCard({ video }) {
  const navigate = useNavigate()
  const open = () => navigate(`/watch/${video.id}`)
 
  return (
    <article className="video-card">
      <div className="thumbnail-container" onClick={open}>
        <img src={video.image || thumb(video.id)} alt={video.title} className="thumbnail" loading="lazy" />
        {video.duration && <span className="duration">{video.duration}</span>}
      </div>
 
      <div className="video-details">
        <div className="channel-avatar">{video.channel?.[0] || '▶'}</div>
 
        <div className="video-text">
          <h3 onClick={open}>{video.title}</h3>
          <p className="channel">{video.channel}</p>
          <p className="meta">
            {video.views && `${video.views} views`}
            {video.views && video.date && ' • '}
            {video.date}
          </p>
        </div>
 
        <button className="more">⋮</button>
      </div>
    </article>
  )
}
 
function VideoGrid({ list, loading }) {
  if (loading && list.length === 0) {
    return (
      <div className="video-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton">
            <div className="skeleton-thumb" />
            <div className="skeleton-line" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
    )
  }
 
  return (
    <div className="video-grid">
      {list.map(video => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
 
/* ------------------------------ Pages ------------------------------ */
function Home() {
  const state = useVideoList('home')
 
  return (
    <main className="main">
      <Categories />
      <div className="content">
        <div className="section-title">
          <h1>Home</h1>
        </div>
        <VideoGrid list={state.list} loading={state.loading} />
      </div>
    </main>
  )
}
 
function SearchPage() {
  const [params] = useSearchParams()
  const query = params.get('q') || ''
  const state = useVideoList('search', query)
 
  const empty = !state.loading && !state.more && state.list.length === 0
  const shown = empty ? videos : state.list
 
  return (
    <main className="main">
      <Categories />
      <div className="content">
        <h1 className="search-title">
          {query ? `Search results for "${query}"` : 'Search'}
        </h1>
 
        {state.more && state.list.length > 0 && (
          <p className="note">Qo‘shimcha natijalar YouTube’dan qidirilmoqda…</p>
        )}
 
        {empty && (
          <p className="note">
            “{query}” bo‘yicha video topilmadi. Tarmoq yoki qidiruv serveri javob bermadi.
            Barqaror ishlashi uchun .env ga VITE_YT_API_KEY qo‘shing. Hozircha tavsiya etilgan videolar:
          </p>
        )}
 
        <VideoGrid list={shown} loading={state.loading} />
      </div>
    </main>
  )
}
 
function Comments({ id }) {
  const [text, setText] = useState('')
  const [comments, setComments] = useStored(`yt-comments-${id}`, [])
 
  function addComment(e) {
    e.preventDefault()
    if (!text.trim()) return
    setComments([{ id: Date.now(), text: text.trim() }, ...comments])
    setText('')
  }
 
  return (
    <section className="comments">
      <h2>{comments.length} Comments</h2>
 
      <form className="comment-form" onSubmit={addComment}>
        <div className="profile">L</div>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a comment..."
        />
        <button type="submit">Post</button>
      </form>
 
      {comments.map(comment => (
        <div className="comment" key={comment.id}>
          <div className="profile">L</div>
          <div>
            <strong>User</strong>{' '}
            <span className="comment-time">{timeAgo(new Date(comment.id).toISOString())}</span>
            <p>{comment.text}</p>
            <button
              className="comment-delete"
              onClick={() => setComments(comments.filter(c => c.id !== comment.id))}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}
 
function WatchRoute() {
  const { id } = useParams()
  return <WatchPage key={id} id={id} />
}
 
function WatchPage({ id }) {
  const [video, setVideo] = useState(() => cache.get(id) || null)
  const [liked, setLiked] = useStored(`yt-like-${id}`, false)
  const [disliked, setDisliked] = useStored(`yt-dislike-${id}`, false)
  const [subs, setSubs] = useStored('yt-subs', [])
  const [copied, setCopied] = useState(false)
  const related = useVideoList('home')
 
  useEffect(() => {
    if (video) return
    let cancelled = false
 
    async function load() {
      try {
        if (API_KEY) {
          const [v] = await fetchByIds([id])
          if (v && !cancelled) return setVideo(v)
        }
      } catch {
        /* ignore */
      }
      if (!cancelled)
        setVideo({
          id,
          title: 'YouTube video',
          channel: 'YouTube',
          views: '',
          date: '',
          description: '',
          image: thumb(id)
        })
    }
 
    load()
    return () => {
      cancelled = true
    }
  }, [id, video])
 
  useEffect(() => {
    if (video) addToHistory(video)
  }, [video])
 
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])
 
  if (!video) {
    return (
      <main className="watch-page">
        <div className="watch-main">
          <div className="player" />
        </div>
      </main>
    )
  }
 
  const subscribed = subs.includes(video.channel)
 
  function toggleSub() {
    setSubs(subscribed ? subs.filter(c => c !== video.channel) : [...subs, video.channel])
  }
 
  function toggleLike() {
    setLiked(!liked)
    if (!liked) setDisliked(false)
  }
 
  function toggleDislike() {
    setDisliked(!disliked)
    if (!disliked) setLiked(false)
  }
 
  async function share() {
    try {
      await navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${id}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }
 
  return (
    <main className="watch-page">
      <div className="watch-main">
        <div className="player">
          <iframe
            src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
 
        <h1 className="watch-title">{video.title}</h1>
 
        <div className="watch-channel">
          <div className="channel-avatar large">{video.channel?.[0] || '▶'}</div>
          <div>
            <strong>{video.channel}</strong>
            <p>{subscribed ? 'Subscribed' : '125K subscribers'}</p>
          </div>
          <button className={`subscribe ${subscribed ? 'subscribed' : ''}`} onClick={toggleSub}>
            {subscribed ? 'Subscribed ✓' : 'Subscribe'}
          </button>
        </div>
 
        <div className="watch-actions">
          <button className={liked ? 'on' : ''} onClick={toggleLike}>
            👍 {liked ? 'Liked' : video.likes || 'Like'}
          </button>
          <button className={disliked ? 'on' : ''} onClick={toggleDislike}>
            👎
          </button>
          <button onClick={share}>{copied ? '✓ Link copied' : '↗ Share'}</button>
          <a
            className="watch-link"
            href={`https://www.youtube.com/watch?v=${id}`}
            target="_blank"
            rel="noreferrer"
          >
            Open on YouTube
          </a>
        </div>
 
        <div className="description">
          <strong>
            {video.views && `${video.views} views`}
            {video.views && video.date && ' • '}
            {video.date}
          </strong>
          <p>{video.description}</p>
        </div>
 
        <Comments id={id} />
      </div>
 
      <aside className="recommendations">
        <h2>Recommended</h2>
        {related.list
          .filter(item => item.id !== id)
          .slice(0, 10)
          .map(item => (
            <Link key={item.id} to={`/watch/${item.id}`} className="recommendation">
              <img src={item.image || thumb(item.id)} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.channel}</p>
                <span>
                  {item.views && `${item.views} views`}
                  {item.views && item.date && ' • '}
                  {item.date}
                </span>
              </div>
            </Link>
          ))}
      </aside>
    </main>
  )
}
 
function Shorts() {
  return (
    <main className="main">
      <div className="content">
        <h1 className="search-title">Shorts</h1>
        <div className="shorts-grid">
          {videos.map(video => (
            <Link key={video.id} to={`/watch/${video.id}`} className="short">
              <img src={video.image} alt={video.title} loading="lazy" />
              <div className="short-info">
                <h3>{video.title}</h3>
                <p>{video.views ? `${video.views} views` : video.channel}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
 
function History() {
  const [history, setHistory] = useStored('yt-history', [])
 
  return (
    <main className="main">
      <div className="content">
        <div className="page-head">
          <h1 className="search-title">Watch history</h1>
          {history.length > 0 && (
            <button className="clear-button" onClick={() => setHistory([])}>
              Clear history
            </button>
          )}
        </div>
 
        {history.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🕘</div>
            <h2>Nothing watched yet</h2>
            <p>Videos you watch will show up here.</p>
            <Link to="/" className="back-button">Back to Home</Link>
          </div>
        ) : (
          <div className="video-grid">
            {history.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
 
function Subscriptions() {
  const [subs, setSubs] = useStored('yt-subs', [])
 
  return (
    <main className="main">
      <div className="content">
        <h1 className="search-title">Subscriptions</h1>
 
        {subs.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">📺</div>
            <h2>No subscriptions yet</h2>
            <p>Press Subscribe on a video page to follow a channel.</p>
            <Link to="/" className="back-button">Back to Home</Link>
          </div>
        ) : (
          <div className="subs-list">
            {subs.map(channel => (
              <div className="sub-item" key={channel}>
                <Link to={`/search?q=${encodeURIComponent(channel)}`} className="sub-link">
                  <div className="channel-avatar large">{channel[0]}</div>
                  <strong>{channel}</strong>
                </Link>
                <button
                  className="subscribe subscribed"
                  onClick={() => setSubs(subs.filter(c => c !== channel))}
                >
                  Unsubscribe
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
 
/* ------------------------------- App ------------------------------- */
function App() {
  const [menu, setMenu] = useState(false)
 
  return (
    <div className="app">
      <Header setMenu={setMenu} />
 
      <div className="layout">
        <Sidebar menu={menu} setMenu={setMenu} />
 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/watch/:id" element={<WatchRoute />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </div>
    </div>
  )
}
 
export default App
 