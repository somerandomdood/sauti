import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  

  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: '' });

  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('sauti_token')}` }
  });

  const showAlert = (msg, type = 'error') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: '', type: '' }), 4000);
  };

  useEffect(() => {
    const fetchLiveDashboardContext = async () => {
      try {

        const profileRes = await axios.get('/api/artists/profile', getAuthHeader());
        setProfile(profileRes.data);


        const chatRes = await axios.get('/api/chat/conversations', getAuthHeader());
        setConversations(chatRes.data);


        const bookingRes = await axios.get('/api/bookings/artist', getAuthHeader());
        setBookings(bookingRes.data);

      } catch (err) {
        console.error("Dashboard error:", err);
        localStorage.clear();
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLiveDashboardContext();
  }, [navigate]);


  const computedHours = bookings
    .filter(b => b.status === 'Confirmed' || b.status === 'Completed')
    .reduce((sum, b) => sum + Number(b.duration), 0);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await axios.put('/api/artists/profile', {
        pricePerHour: profile.pricePerHour,
        genre: profile.genre,
        role: profile.role,
        description: profile.description
      }, getAuthHeader());
      if (res.data.success) {
        showAlert('Your profile changes have been saved!', 'success');
      }
    } catch {
      showAlert('Could not save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center text-gray-400 font-sans">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="bg-[#07070a] min-h-screen text-gray-200 font-sans antialiased relative overflow-hidden pb-12">
      
      {/* Background Lights */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Global Notification Strip */}
      <div className={`fixed top-0 left-0 w-full text-white text-xs font-bold text-center py-3 transition-transform duration-300 transform z-50 ${alert.show ? 'translate-y-0' : '-translate-y-full'} ${alert.type === 'success' ? 'bg-brand-600' : 'bg-red-500/95 context-blur'}`}>
        {alert.msg}
      </div>

      {/* Navigation Header */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2.5">
            <span className="text-base font-black tracking-tight text-white">
              Sauti<span className="text-brand-500">Dashboard</span>
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

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-6 relative z-10">
        
        {/* Profile Card Banner */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-studio-950 flex items-center justify-center text-xl font-black shadow-md shadow-brand-500/10">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">{profile.name}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{profile.role || 'Independent Artist'} &bull; <span className="text-brand-400 font-bold">{profile.genre}</span></p>
            </div>
          </div>
          <span className="text-[10px] bg-black/40 border border-white/5 text-emerald-400 uppercase font-black tracking-widest px-4 py-2 rounded-xl select-none">
            Account Active
          </span>
        </header>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[2rem] shadow-md">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Earnings Balance</p>
            <p className="text-2xl font-black text-white mt-1">KSh {(profile.walletBalance || 0).toLocaleString()}</p>
            <span className="text-[11px] text-brand-400 font-semibold block mt-1"><i className="fa-solid fa-shield-halved text-[10px]"></i> Protected by M-Pesa Escrow</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[2rem] shadow-md">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Booked Hours</p>
            <p className="text-2xl font-black text-white mt-1">{computedHours} Hours</p>
            <span className="text-[11px] text-gray-500 block mt-1">From confirmed work sessions</span>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-[2rem] shadow-md">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Profile Visibility</p>
            <p className="text-2xl font-black text-purple-400 mt-1">{profile.aiScore || 75}%</p>
            <span className="text-[11px] text-purple-500 block mt-1"><i className="fa-solid fa-chart-line text-[10px]"></i> Search placement score</span>
          </div>
        </div>

        {/* Split Content Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column*/}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Message Channels */}
            <section className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] shadow-md">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <i className="fa-solid fa-comments text-brand-400"></i> Your Messages
              </h3>
              
              {conversations.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs italic bg-black/20 border border-dashed border-white/5 rounded-2xl">
                  No messages yet. When a producer reaches out to you, the chat room will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((chat) => (
                    <div key={chat.roomId} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse"></span>
                          <h4 className="text-xs font-bold text-white truncate">{chat.scoutName}</h4>
                        </div>
                        <p className="text-xs text-gray-400 truncate pl-3.5 italic">"{chat.lastMessage}"</p>
                      </div>
                      <button 
                        onClick={() => navigate(`/chat/${chat.roomId}`, { state: { recipientName: chat.scoutName } })}
                        className="w-full sm:w-auto bg-white/5 hover:bg-brand-500 hover:text-studio-950 border border-white/10 hover:border-brand-500 text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition text-center"
                      >
                        Open Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Booking History Records */}
            <section className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] shadow-md">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-5 pb-2 border-b border-white/5 flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-brand-400"></i> Booking History
              </h3>
              
              {bookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-xs italic bg-black/20 border border-dashed border-white/5 rounded-2xl">
                  No bookings recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map(booking => (
                    <div key={booking._id} className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-white tracking-tight">{booking.scoutName}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{booking.date} &bull; Work Session: {booking.duration} hours</p>
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider mt-2.5 px-2.5 py-0.5 rounded-md border ${booking.status === 'Confirmed' ? 'bg-brand-500/10 border-brand-500/20 text-brand-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-base font-black text-white tracking-tight">KSh {booking.payout.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Sidebar - Profile Management Form*/}
          <aside className="lg:col-span-5 h-fit">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] shadow-md space-y-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 pb-2 border-b border-white/5 flex items-center gap-2">
                <i className="fa-solid fa-gear text-brand-400"></i> Edit Profile Settings
              </h3>

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                
                {/* Specialty Role Title Input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Your Specialty / Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Lead Singer, Audio Engineer"
                    value={profile.role || ''} 
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="glass-input w-full rounded-xl py-3 px-4 text-white text-sm font-semibold" 
                  />
                </div>

                {/* Hourly Price Input */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Hourly Price Rate</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={profile.pricePerHour || ''} 
                      onChange={(e) => setProfile({ ...profile, pricePerHour: e.target.value })}
                      className="glass-input w-full rounded-xl py-3.5 px-4 text-white text-sm font-bold pr-14" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500 tracking-widest uppercase select-none">KSh</span>
                  </div>
                </div>

                {/* Genre Selector Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Main Music Genre</label>
                  <select 
                    value={profile.genre || 'Gengetone'} 
                    onChange={(e) => setProfile({ ...profile, genre: e.target.value })}
                    className="glass-input w-full text-gray-300 rounded-xl py-3.5 px-4 text-xs font-bold outline-none cursor-pointer"
                  >
                    {['Gengetone', 'Benga', 'Ohangla', 'Kapuka', 'Afrobeats'].map(g => (
                      <option key={g} value={g} className="bg-[#0f172a] text-white font-bold">{g}</option>
                    ))}
                  </select>
                </div>

                {/* Description Text*/}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Bio / Profile Description</label>
                  <textarea 
                    rows="4"
                    placeholder="Describe your studio gear, sound preferences, and musical experience..."
                    value={profile.description || ''} 
                    onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                    className="glass-input w-full rounded-xl py-3 px-4 text-white text-xs font-medium resize-none leading-relaxed" 
                  />
                </div>

                {/* Save Button */}
                <button 
                  type="submit" 
                  disabled={isSaving} 
                  className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-studio-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition duration-150 shadow-lg shadow-brand-500/10"
                >
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </aside>
          
        </div>
      </div>
    </div>
  );
}
