import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Auth() {
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ show: false, msg: '', type: '' });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Artist' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false });
  };

  const showAlert = (msg, type = 'error') => {
    setAlert({ show: true, msg, type });
    setTimeout(() => setAlert({ show: false, msg: '', type: '' }), 4000);
  };

  const validateForm = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = true;
    if (!formData.password || formData.password.length < 6) newErrors.password = true;
    if (!isLogin && (!formData.name || formData.name.trim().length < 2)) newErrors.name = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showAlert("Please fill out all fields correctly.", "error");
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await axios.post(endpoint, {
        email: formData.email.trim(),
        password: formData.password,
        ...(!isLogin && { name: formData.name.trim(), role: formData.role })
      });
      
      localStorage.setItem('sauti_token', response.data.token);
      localStorage.setItem('sauti_user', JSON.stringify(response.data.user));
      
      showAlert('Welcome to SautiLocator!', 'success');
      
      setTimeout(() => {
        if (response.data.user.role === 'Artist') {
          if (!isLogin) navigate('/onboarding');
          else navigate('/dashboard');
        } else {

          if (!isLogin) navigate('/scout-onboarding');
          else navigate('/discover');
        }
      }, 1000);

    } catch (err) {
      showAlert(err.response?.data?.error || 'Login failed. Please check your details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 antialiased">
      <main className="relative w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/10 pb-8 pt-10 px-6 sm:px-10 overflow-hidden">
        
        <div className={`absolute top-0 left-0 w-full text-white text-sm font-semibold text-center py-3 transition-transform duration-300 transform z-50 ${alert.show ? 'translate-y-0' : '-translate-y-full'} ${alert.type === 'success' ? 'bg-brand-600' : 'bg-red-500/95 context-blur'}`}>
          {alert.msg}
        </div>

        <header className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">Find Your Frequency</h1>
          <p className="text-sm text-gray-400 font-medium">Connect with Kenya's elite audio professionals.</p>
        </header>

        <div className="relative flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5">
          <div className="absolute top-1.5 left-1.5 w-[calc(50%-6px)] h-[calc(100%-12px)] bg-brand-500 rounded-xl transition-transform duration-300" style={{ transform: isLogin ? 'translateX(0)' : 'translateX(100%)' }}></div>
          <button type="button" onClick={() => setIsLogin(true)} className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${isLogin ? 'text-white' : 'text-gray-400'}`}>Log In</button>
          <button type="button" onClick={() => setIsLogin(false)} className={`relative z-10 flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${!isLogin ? 'text-white' : 'text-gray-400'}`}>Join Network</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {!isLogin && (
            <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Your Professional Name</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="E.g., Producer Jojo, Magic Eng" 
                  className={`glass-input w-full rounded-xl py-3.5 px-4 text-base sm:text-sm ${errors.name ? 'error-ring' : ''}`} 
                />
              </div>

              <div className="relative z-50">
                <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">What do you do?</label>
                <button 
                  type="button" onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="glass-input glass-btn w-full flex justify-between items-center rounded-xl py-3.5 px-4 text-left text-base sm:text-sm text-gray-200"
                >
                  <span>{formData.role === 'Artist' ? 'I am an Artist (Looking for bookings)' : 'I am a Producer/Scout (Hiring talent)'}</span>
                  <span className="text-xs">▼</span>
                </button>
                
                {isRoleDropdownOpen && (
                  <ul className="absolute left-0 w-full mt-2 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <li>
                      <button type="button" onClick={() => { setFormData({...formData, role: 'Artist'}); setIsRoleDropdownOpen(false); }} className="w-full text-left px-4 py-3.5 text-sm text-gray-300 hover:bg-brand-500/20 hover:text-white transition-colors">
                        I am an Artist (Looking for bookings)
                      </button>
                    </li>
                    <li>
                      <button type="button" onClick={() => { setFormData({...formData, role: 'Scout'}); setIsRoleDropdownOpen(false); }} className="w-full text-left px-4 py-3.5 text-sm text-gray-300 hover:bg-brand-500/20 hover:text-white transition-colors">
                        I am a Producer/Scout (Hiring talent)
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" name="email" value={formData.email} onChange={handleChange}
              placeholder="name@domain.com" 
              className={`glass-input w-full rounded-xl py-3.5 px-4 text-base sm:text-sm ${errors.email ? 'error-ring' : ''}`} 
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                placeholder="Enter password" 
                className={`glass-input w-full rounded-xl py-3.5 pl-4 pr-12 text-base sm:text-sm ${errors.password ? 'error-ring' : ''}`} 
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-bold uppercase tracking-wider select-none">
                 {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button disabled={isLoading} type="submit" className="w-full bg-brand-500 hover:bg-brand-400 text-studio-950 font-black text-sm uppercase tracking-wide py-4 rounded-xl transition-all duration-200 mt-8 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? 'Connecting...' : (isLogin ? 'Sign In' : 'Create My Account')}
          </button>
        </form>
      </main>
    </div>
  );
}
