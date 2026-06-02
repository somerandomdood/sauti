import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ArtistProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [artist, setArtist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, msg: '', type: '' });
  

  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const showAlert = (msg, type = 'error') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: '', type: '' }), 4000);
  };

  useEffect(() => {
    const fetchIndividualProfile = async () => {
      try {
        const token = localStorage.getItem('sauti_token');
        const res = await axios.get(`/api/artists/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setArtist(res.data);
      } catch (err) {
        showAlert('Could not find this artist profile.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchIndividualProfile();
  }, [id]);

  const handleMpesaPayment = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 9) {
      showAlert('Please enter a valid M-Pesa phone number.');
      return;
    }
    setIsProcessing(true);
    showAlert('Sending payment prompt to your phone...', 'success');
    
    try {
      const token = localStorage.getItem('sauti_token');
      await axios.post('/api/booking/pay', { 
        artistId: artist._id, 
        phoneNumber: phone, 
        amount: 10 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showAlert('M-Pesa prompt sent! Enter your PIN on your phone to finish booking.', 'success');
      setPhone('');
    } catch {
      showAlert('Payment failed. Please check your network and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center text-gray-400 font-sans">
        Loading profile details...
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center text-red-400 font-sans">
        Artist profile not found.
      </div>
    );
  }

  return (
    <div className="bg-[#07070a] min-h-screen text-gray-200 font-sans antialiased pb-12 relative overflow-hidden">
      
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Sliding Drop Alert banner */}
      <div className={`fixed top-0 left-0 w-full text-white text-xs font-bold text-center py-3 transition-transform duration-300 transform z-50 ${alert.show ? 'translate-y-0' : '-translate-y-full'} ${alert.type === 'success' ? 'bg-brand-600' : 'bg-red-500/95 context-blur'}`}>
        {alert.msg}
      </div>

      {/* Top Navigation */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex justify-between items-center px-4">
          <button onClick={() => navigate('/discover')} className="text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 border border-white/10 rounded-xl transition-all duration-150">
            ← Back to Explore
          </button>

        </div>
      </nav>

      {/* Main Workspace Split Grid Layout */}
      <div className="max-w-5xl mx-auto px-4 mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Left Elements: Card Information & Review Loops */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Header Metadata Banner */}
          <header className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] shadow-xl flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-emerald-400 text-studio-950 flex items-center justify-center text-2xl font-black shadow-md">
              {artist.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">{artist.name}</h1>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{artist.role} &bull; <span className="text-brand-400 font-bold">{artist.genre}</span></p>
              
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mt-2">
                <span className="text-gray-300 flex items-center gap-1 bg-black/40 border border-white/5 px-2.5 py-0.5 rounded-md">
                  <i className="fa-solid fa-star text-amber-500 text-[10px]"></i> 
                  {(artist.rating || 5.0).toFixed(1)}
                </span>
                <span>({artist.reviewCount || 0} customer reviews)</span>
              </div>
            </div>
          </header>

          {/* Bio Description Area */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] shadow-md">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">About the Artist</h3>
            <div className="text-sm text-gray-300 leading-relaxed bg-black/20 p-4 border border-white/5 rounded-2xl">
              {artist.description && artist.description.trim() !== "" ? (
                artist.description
              ) : (
                <span className="text-gray-500 italic">Description not available</span>
              )}
            </div>
          </section>

          {/* Customer Reviews Mapping Group */}
          <section className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] shadow-md space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 border-b border-white/5 pb-2">What people are saying</h3>
            
            {artist.reviews && artist.reviews.length > 0 ? (
              <div className="space-y-3">
                {artist.reviews.map((review, idx) => (
                  <div key={idx} className="bg-black/20 border border-white/5 p-4 rounded-2xl space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{review.reviewerName}</span>
                      <span className="text-xs font-black text-amber-400 bg-amber-400/5 border border-amber-500/10 px-2 py-0.5 rounded-md">
                        {review.rating} ★
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic p-4 text-center bg-black/10 border border-dashed border-white/5 rounded-2xl">
                No reviews recorded for this artist yet.
              </p>
            )}
          </section>

        </div>

        {/* Right Sidebar: Interactive Messenger Launcher & M-Pesa Booking Block */}
        <aside className="col-span-1 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] shadow-md h-fit space-y-5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Rate / Pricing</span>
            <h3 className="text-xl font-black text-white mt-0.5">KSh {artist.pricePerHour?.toLocaleString()}<span className="text-xs font-medium text-gray-500"> / hr</span></h3>
            <p className="text-[11px] text-purple-400 font-bold mt-0.5"><i className="fa-solid fa-chart-line text-[10px]"></i> {artist.aiScore || 75}% Style Match</p>
          </div>

          {/* Embedded Dynamic Route Real-Time Chat Trigger */}
          <button 
            onClick={() => {
              const activeUser = JSON.parse(localStorage.getItem('sauti_user'));
              const roomKey = [activeUser.id, artist.userId].sort().join('_');
              navigate(`/chat/${roomKey}`, { state: { recipientName: artist.name } });
            }}
            className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-black uppercase tracking-wider py-3.5 rounded-xl transition duration-150 text-center flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-comments text-brand-500"></i> Message Artist
          </button>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Book Studio Session</label>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">M-Pesa</span>
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold select-none">+254</span>
              <input 
                type="tel" placeholder="712345678" value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="glass-input w-full rounded-xl py-3.5 pl-14 pr-4 text-white text-sm" 
              />
            </div>
            
            <button 
              onClick={handleMpesaPayment} disabled={isProcessing}
              className="w-full bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-studio-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition duration-150 shadow-lg shadow-brand-500/10"
            >
              {isProcessing ? 'Sending request...' : 'Book with M-Pesa'}
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
