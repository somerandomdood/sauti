import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Discover() {
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ minRating: 3.5, genres: ['Gengetone', 'Benga', 'Ohangla', 'Kapuka', 'Afrobeats'] });
  const [location, setLocation] = useState({ lng: null, lat: null, status: 'GPS Ready' });
  const [alert, setAlert] = useState({ show: false, msg: '', type: '' });

  const showAlert = (msg, type = 'error') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: '', type: '' }), 4000);
  };

  const fetchTalent = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/artists/discover', {
        lng: location.lng,
        lat: location.lat,
        maxDistanceKm: 30,
        genres: filters.genres,
        minRating: filters.minRating
      });
      setArtists(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTalent();
  }, [filters, location.lat, location.lng]);

  const syncGPS = () => {
    setLocation(prev => ({ ...prev, status: 'Finding location...' }));
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lng: pos.coords.longitude, lat: pos.coords.latitude, status: 'Location updated' });
          showAlert('Location shared successfully!', 'success');
        },
        () => {
          setLocation(prev => ({ ...prev, status: 'Access denied' }));
          showAlert('Could not read your location. Check browser settings.', 'error');
        }
      );
    }
  };

  const toggleGenre = (genre) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
    }));
  };

  return (
    <div className="bg-[#07070a] min-h-screen text-gray-200 font-sans antialiased relative overflow-hidden pb-12">
      
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-12 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none"></div>

      <div className={`fixed top-0 left-0 w-full text-white text-xs font-bold text-center py-3 transition-transform duration-300 transform z-50 ${alert.show ? 'translate-y-0' : '-translate-y-full'} ${alert.type === 'success' ? 'bg-brand-600' : 'bg-red-500/95 context-blur'}`}>
        {alert.msg}
      </div>

      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2.5">
            
            <span className="text-base font-black tracking-tight text-white">
              Sauti<span className="text-brand-500">Locator</span>
            </span>
          </div>
          <button 
            onClick={() => { localStorage.clear(); navigate('/auth'); }} 
            className="text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 border border-white/10 rounded-xl transition-all duration-150"
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        
        <aside className="col-span-1 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] h-fit shadow-xl">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
            <i className="fa-solid fa-sliders text-brand-400"></i> Search Options
          </h3>
          
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Find Near Me</label>
            <button 
              onClick={syncGPS} 
              className="w-full bg-brand-500 hover:bg-brand-400 text-studio-950 py-3.5 rounded-xl flex items-center justify-center gap-2 transition font-black text-xs uppercase tracking-wide shadow-lg shadow-brand-500/10"
            >
              <i className="fa-solid fa-location-crosshairs"></i> Use My Location
            </button>
            <p className="text-[11px] font-semibold text-gray-500 mt-2.5 text-center italic">{location.status}</p>
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Music Styles</label>
            <div className="space-y-2">
              {['Gengetone', 'Benga', 'Ohangla', 'Kapuka', 'Afrobeats'].map(genre => {
                const isSelected = filters.genres.includes(genre);
                return (
                  <label 
                    key={genre} 
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition select-none ${isSelected ? 'bg-brand-500/10 border-brand-500 text-white' : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/10'}`}
                  >
                    <span className="text-xs font-bold tracking-wide">{genre}</span>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => toggleGenre(genre)} 
                      className="w-4 h-4 accent-brand-400 rounded bg-black border-white/10 text-brand-500 focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                    />
                  </label>
                );
              })}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Minimum Rating</label>
              <span className="text-xs font-black text-brand-400 bg-brand-500/10 border border-brand-500/10 px-2.5 py-0.5 rounded-lg">{filters.minRating} ★</span>
            </div>
            <div className="bg-black/30 border border-white/5 p-4 rounded-xl flex items-center gap-3">
              <i className="fa-solid fa-volume-high text-gray-600 text-xs select-none"></i>
              <input 
                type="range" min="0" max="5" step="0.5" 
                value={filters.minRating} 
                onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                className="w-full accent-brand-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" 
              />
            </div>
          </div>
        </aside>

        <main className="col-span-1 lg:col-span-3 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 px-2">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Available Artists</h2>
              <p className="text-xs text-gray-400">Browse verified music professionals close to your area.</p>
            </div>
            <span className="text-xs bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300 font-bold select-none">
              {artists.length} Available
            </span>
          </div>

          <div className="space-y-3.5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem]">
                <i className="fa-solid fa-circle-notch fa-spin text-xl text-brand-400"></i>
                <p className="text-xs font-bold text-gray-500 mt-3">Searching for artists...</p>
              </div>
            ) : artists.length === 0 ? (
              <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-[2.5rem] text-gray-500 text-xs font-medium italic">
                No artists match your current search options.
              </div>
            ) : (
              artists.map(artist => (
                <div 
                  key={artist._id} 
                  className="bg-white/5 border border-white/10 rounded-[2.5rem] p-5 md:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all duration-150 group hover:bg-white/10 hover:border-white/20 shadow-xl"
                >
                  
                  <div className="flex items-center gap-5 w-full">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-800 via-zinc-950 to-gray-900 border border-white/10 flex items-center justify-center relative flex-shrink-0 shadow-inner">
                      <div className="w-4 h-4 rounded-full bg-[#07070a] border border-white/5 flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-gray-600"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-black text-white tracking-tight group-hover:text-brand-400 transition-colors duration-150">{artist.name}</h4>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-black/40 border border-white/5 px-2.5 py-0.5 rounded-md text-gray-300">
                          {artist.genre}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-medium tracking-wide">{artist.role}</p>
                      
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-500 pt-0.5">
                        <span className="text-gray-300 flex items-center gap-1">
                          <i className="fa-solid fa-star text-amber-500 text-[10px]"></i> 
                          {(artist.rating || 5.0).toFixed(1)}
                        </span>
                        <span>&bull;</span>
                        <span className="text-[11px] text-gray-400">{artist.reviewCount || 0} reviews</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden md:flex h-6 items-end gap-[3px] bg-black/20 border border-white/5 px-3.5 py-1 rounded-xl w-32 flex-shrink-0 select-none">
                    <div className="w-[3px] bg-gray-700 h-1.5 rounded-full"></div>
                    <div className="w-[3px] bg-brand-500/40 h-3 rounded-full group-hover:bg-brand-400 transition-colors"></div>
                    <div className="w-[3px] bg-brand-500/40 h-4 rounded-full group-hover:bg-brand-400 transition-colors"></div>
                    <div className="w-[3px] bg-gray-700 h-2.5 rounded-full"></div>
                    <div className="w-[3px] bg-brand-500/40 h-5 rounded-full group-hover:bg-brand-400 transition-colors"></div>
                    <div className="w-[3px] bg-brand-500/40 h-3.5 rounded-full group-hover:bg-brand-400 transition-colors"></div>
                    <div className="w-[3px] bg-gray-700 h-2 rounded-full"></div>
                  </div>

                  <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t border-white/5 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                    <div className="sm:text-right">
                      <p className="text-[10px] font-black uppercase tracking-wider text-purple-400 mb-0.5">
                        {artist.aiScore || 75}% Match
                      </p>
                      <p className="text-base font-black text-white tracking-tight">
                        KSh {artist.pricePerHour?.toLocaleString()}
                        <span className="text-xs font-medium text-gray-500">/hr</span>
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/artist/${artist._id}`)}
                      className="w-full sm:w-auto bg-white/5 hover:bg-brand-500 hover:text-studio-950 border border-white/10 hover:border-brand-500 text-xs font-black uppercase tracking-wider px-5 py-3 rounded-xl transition duration-150 text-center shadow-lg"
                    >
                      View Profile
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
