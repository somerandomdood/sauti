import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ScoutOnboarding() {
  const navigate = useNavigate();
  const [scoutName, setScoutName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: '' });
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    studioName: '',
    scoutType: 'Independent Producer',
    preferredGenres: '',
    lookingFor: '',
    bio: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('sauti_user'));
    if (!user || user.role !== 'Scout') {
      navigate('/auth');
      return;
    }
    setScoutName(user.name);
  }, [navigate]);

  const showAlert = (msg, type = 'error') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: '', type: '' }), 4000);
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!form.studioName || !form.preferredGenres || !form.lookingFor || !form.bio.trim()) {
      showAlert('Please fill out all fields to complete your profile.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('sauti_token');
      const res = await axios.put('/api/scouts/profile', form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        showAlert('Your search profile is active!', 'success');
        setTimeout(() => navigate('/discover'), 1500);
      }
    } catch (err) {
      showAlert('Could not save your setup choices.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 antialiased relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative w-full max-w-xl bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 py-10 px-6 sm:px-10 overflow-hidden z-10">
        
        <div className={`absolute top-0 left-0 w-full text-white text-xs font-bold text-center py-3 transition-transform duration-300 transform z-50 ${alert.show ? 'translate-y-0' : '-translate-y-full'} ${alert.type === 'success' ? 'bg-brand-600' : 'bg-red-500/95 context-blur'}`}>
          {alert.msg}
        </div>

        <header className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Setup Your Scout Account</h1>
          <p className="text-sm text-gray-400 font-medium">Welcome, {scoutName}. Tell us what kind of musical talent you are looking for.</p>
        </header>

        <form onSubmit={handleSetupSubmit} className="space-y-6">
          
          {/* Studio or Record Label Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Studio / Label Name</label>
            <input 
              type="text" 
              placeholder="e.g. GreenHouse Records, Main Switch, or Independent"
              value={form.studioName}
              onChange={(e) => setForm({ ...form, studioName: e.target.value })}
              className="glass-input w-full rounded-xl py-3.5 px-4 text-white text-sm"
            />
          </div>

          {/* Scout Focus Type */}
          <div className="relative">
  <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">What is your primary title?</label>
  <button 
    type="button" 
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="glass-input glass-btn w-full flex justify-between items-center rounded-xl py-3.5 px-4 text-left text-sm text-gray-200 border border-white/10 hover:border-brand-500 transition-all focus:border-brand-400 focus:ring-1 focus:ring-brand-400 outline-none"
  >
    <span className="font-semibold">{form.scoutType}</span>
    <span className={`text-[10px] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}>▼</span>
  </button>
  
  {isDropdownOpen && (
    <ul className="absolute left-0 w-full mt-2 bg-[#0e0f14]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5 animate-[fadeIn_0.15s_ease-out]">
      {[
        'Independent Producer',
        'Record Label Executive',
        'Talent Manager / Agent',
        'Commercial / Jingle Director'
      ].map(option => (
        <li key={option}>
          <button 
            type="button" 
            onClick={() => { 
              setForm({ ...form, scoutType: option }); 
              setIsDropdownOpen(false); 
            }} 
            className={`w-full text-left px-4 py-3.5 text-xs font-semibold transition-colors flex items-center justify-between ${form.scoutType === option ? 'bg-brand-500/15 text-brand-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <span>{option}</span>
            {form.scoutType === option && <span className="text-[10px]">●</span>}
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

          {/* Specific Talent Needs */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">What talent do you need right now?</label>
            <input 
              type="text" 
              placeholder="e.g. Female Vocalists, Lyricists, Bass Guitarists"
              value={form.lookingFor}
              onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
              className="glass-input w-full rounded-xl py-3.5 px-4 text-white text-sm"
            />
          </div>

          {/* Professional Bio */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">About Your Projects</label>
        
            </div>
            <textarea 
              rows="3"
              placeholder="Tell artists about your upcoming tracks, past work, or what you expect from a collaboration..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="glass-input w-full rounded-xl py-3.5 px-4 text-white text-sm resize-none leading-relaxed"
            />
          </div>

          <button 
            disabled={isLoading} 
            type="submit" 
            className="w-full bg-brand-500 hover:bg-brand-400 text-studio-950 font-black text-sm uppercase tracking-wide py-4 rounded-xl transition-all duration-200 mt-4 shadow-xl shadow-brand-500/10 disabled:opacity-50"
          >
            {isLoading ? 'Saving Options...' : 'Open Explore Board'}
          </button>
        </form>
      </main>
    </div>
  );
}
