import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('sauti_user'));
  const isLoggedIn = !!localStorage.getItem('sauti_token');

  const handleGetStarted = () => {
    if (!isLoggedIn) {
      navigate('/auth');
    } else if (user?.role === 'Artist') {
      navigate('/dashboard');
    } else {
      navigate('/discover');
    }
  };

  return (
    <div className="bg-[#07070a] min-h-screen text-gray-200 font-sans antialiased relative overflow-hidden flex flex-col justify-between">
      
      <div className="absolute top-[-10%] left-1/4 w-[800px] h-[800px] bg-brand-500/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-2.5">
            
            <i className="fa-solid fa-music text-studio-950 text-xs"></i>

            <span className="text-base font-black tracking-tight text-white">
              Sauti<span className="text-brand-500">Locator</span>
            </span>
          </div>
          
          <button 
            onClick={() => navigate('/auth')} 
            className="text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 text-gray-300 px-5 py-2.5 border border-white/10 rounded-xl transition-all duration-150"
          >
            {isLoggedIn ? 'Access Account' : 'Sign In'}
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-4 flex flex-col items-center justify-center text-center py-20 relative z-10 space-y-8">
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
            Bridge the Gap Between <br />
            <span className="bg-gradient-to-r from-brand-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              Talent & Production
            </span>
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto font-medium leading-relaxed">
            SautiLocator seamlessly hooks talented Kenyan vocalists, musicians, and audio professionals directly with music producers and talent scouts looking to hire.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
          <button 
            onClick={handleGetStarted}
            className="w-full sm:w-56 bg-brand-500 hover:bg-brand-400 text-studio-950 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition-all duration-200 shadow-xl shadow-brand-500/10 active:scale-[0.98]"
          >
            {isLoggedIn ? 'Go to My Dashboard' : 'Explore Available Talent'}
          </button>
          
          {!isLoggedIn && (
            <button 
              onClick={() => navigate('/auth')}
              className="w-full sm:w-56 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-black text-xs uppercase tracking-wider py-4 rounded-xl transition-all duration-200"
            >
              Join as a Creator
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-12 text-left">
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-md flex flex-col justify-center">
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Location Sorting</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">Find elite musicians and background vocalists working right inside your neighborhood.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-md flex flex-col justify-center">
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Real-Time Messaging</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">Chat instantly with creators to arrange project requirements and setup studio schedules.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-md flex flex-col justify-center">
            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-2">Secured Bookings</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">Lock down session booking times seamlessly using integrated automated M-Pesa channels.</p>
          </div>

        </div>

      </main>

      <footer className="border-t border-white/5 bg-black/20 py-6 text-center text-[10px] font-bold text-gray-600 uppercase tracking-widest relative z-10">
        © 2026 SautiLocator Network &bull; Empowering Autonomous Audio Production
      </footer>

    </div>
  );
}
