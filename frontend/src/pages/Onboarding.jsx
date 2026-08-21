import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Onboarding() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: '' });

  const [form, setForm] = useState({
    role: '',
    genre: 'Gengetone',
    pricePerHour: '',
    description: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('sauti_user'));
    if (!user || user.role !== 'Artist') {
      navigate('/auth');
      return;
    }
    setUserName(user.name);
  }, [navigate]);

  const showAlert = (msg, type = 'error') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: '', type: '' }), 4000);
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    if (!form.role || !form.pricePerHour || !form.description.trim()) {
      showAlert('Please fill out all fields to complete your profile.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('sauti_token');
      const res = await axios.put('/api/artists/profile', form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        showAlert('Your profile is ready!', 'success');
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      showAlert('Could not save your profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 antialiased relative overflow-hidden">
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="relative w-full max-w-xl bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 py-10 px-6 sm:px-10 overflow-hidden z-10">
        
        <div className={`absolute top-0 left-0 w-full text-white text-xs font-bold text-center py-3 transition-transform duration-300 transform z-50 ${alert.show ? 'translate-y-0' : '-translate-y-full'} ${alert.type === 'success' ? 'bg-brand-600' : 'bg-red-500/95 context-blur'}`}>
          {alert.msg}
        </div>

        <header className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Create Your Profile</h1>
          <p className="text-sm text-gray-400 font-medium">Welcome, {userName}. Let's add more details for people looking to hire you.</p>
        </header>

        <form onSubmit={handleSetupSubmit} className="space-y-6">
          
          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">What is your specialty?</label>
            <input 
              type="text" 
              placeholder="e.g. Lead Singer, Music Producer, Guitarist, Audio Engineer"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="glass-input w-full rounded-xl py-3.5 px-4 text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Main Music Style / Genre</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
              {['Gengetone', 'Benga', 'Ohangla', 'Kapuka', 'Afrobeats'].map(style => {
                const isSelected = form.genre === style;
                return (
                  <button
                    key={style} type="button"
                    onClick={() => setForm({ ...form, genre: style })}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all duration-300 ${isSelected ? 'bg-brand-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">Hourly Price rate (KSh)</label>
            <div className="relative">
              <input 
                type="number" 
                placeholder="e.g. 2000, 3500"
                value={form.pricePerHour}
                onChange={(e) => setForm({ ...form, pricePerHour: e.target.value })}
                className="glass-input w-full rounded-xl py-3.5 px-4 text-white text-sm pr-16" 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 uppercase tracking-widest">/ hr</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Tell us about yourself</label>

            </div>
            <textarea 
              rows="3"
              placeholder="Describe your studio gear, past projects, or your musical journey..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="glass-input w-full rounded-xl py-3.5 px-4 text-white text-sm resize-none leading-relaxed"
            />
          </div>

          <button 
            disabled={isLoading} 
            type="submit" 
            className="w-full bg-brand-500 hover:bg-brand-400 text-studio-950 font-black text-sm uppercase tracking-wide py-4 rounded-xl transition-all duration-200 mt-4 shadow-xl shadow-brand-500/10 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Finish & Go to Dashboard'}
          </button>
        </form>
      </main>
    </div>
  );
}
