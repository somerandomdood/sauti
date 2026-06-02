import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
const socket = io();

export default function Chat() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const pageLocation = useLocation();

  const [messages, setMessages] = useState([]);
  const [typedText, setTypedText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  const partnerName = pageLocation.state?.recipientName || "Artist Workspace";
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const userObj = JSON.parse(localStorage.getItem('sauti_user'));
    if (!userObj) {
      navigate('/auth');
      return;
    }
    setCurrentUser(userObj);

    const loadConversationArchives = async () => {
      try {
        const token = localStorage.getItem('sauti_token');
        const res = await axios.get(`/api/chat/history/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
        setTimeout(scrollToBottom, 100);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    loadConversationArchives();

    socket.emit('join_room', { roomId });

    socket.on('receive_message', (incomingMessage) => {
      setMessages((prev) => [...prev, incomingMessage]);
      setTimeout(scrollToBottom, 50);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [roomId, navigate]);

  const emitOutgoingMessage = (e) => {
    e.preventDefault();
    if (!typedText.trim()) return;

    const payload = {
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: typedText.trim()
    };

    socket.emit('send_message', payload);
    setTypedText('');
  };

  if (!currentUser) return null;

  return (
    <div className="bg-[#07070a] min-h-screen text-gray-200 font-sans flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Studio Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header Navigation Strip */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-4 sticky top-0 z-50 flex items-center justify-between shadow-md relative">
        <button 
          onClick={() => navigate(-1)}
          className="text-xs font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 px-4 py-2 rounded-xl transition-all duration-150"
        >
          ← Go Back
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black text-white tracking-tight">{partnerName}</h2>
          
        </div>
        <div className="w-20 hidden sm:block"></div>
      </nav>

      {/* Chat Messages Frame View */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] relative z-10">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-xs italic border border-dashed border-white/10 rounded-[2rem] bg-white/5 backdrop-blur-md">
            No messages here yet. Send a message below to start chatting!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div 
                key={idx} 
                className={`flex flex-col max-w-[75%] space-y-1 ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <span className="text-[9px] text-gray-500 font-bold px-1">{msg.senderName}</span>
                <div className={`p-3.5 rounded-2xl text-xs font-semibold border leading-relaxed ${isMe ? 'bg-brand-500 border-brand-500 text-studio-950 rounded-tr-none shadow-lg shadow-brand-500/5' : 'bg-white/5 border-white/10 text-gray-100 rounded-tl-none'}`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-600 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </main>

      {/* Message Input Box Footer Form */}
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 p-4 sticky bottom-0 z-50 relative">
        <form onSubmit={emitOutgoingMessage} className="max-w-3xl w-full mx-auto flex gap-3">
          <input 
            type="text" 
            placeholder="Write a message..." 
            value={typedText}
            onChange={(e) => setTypedText(e.target.value)}
            className="glass-input w-full rounded-xl py-3.5 px-4 text-xs font-semibold text-white outline-none placeholder:text-gray-600" 
          />
          <button 
            type="submit"
            className="bg-brand-500 hover:bg-brand-400 text-studio-950 font-black px-6 rounded-xl transition duration-150 text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-brand-500/10 active:scale-[0.96]"
          >
            <i className="fa-solid fa-paper-plane text-[10px]"></i> Send
          </button>
        </form>
      </footer>

    </div>
  );
}
