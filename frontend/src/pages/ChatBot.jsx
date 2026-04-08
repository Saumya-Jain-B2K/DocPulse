import React, { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import ReactMarkdown from 'react-markdown';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ChatBot = () => {
    const { token } = useContext(AppContext);
    const navigate = useNavigate();

    // UI state
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello! 👋 I am your **DocPulse AI Triage Assistant**.\n\nPlease describe your symptoms in detail (e.g., severity, duration) so I can help diagnose your problem, suggest first-aid, and recommend available DocPulse specialists." }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Refs
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Connect Socket ONLY if token exists
    useEffect(() => {
        if (!token) return;

        // Initialize connection to AI microservice
        socketRef.current = io('http://localhost:4001', {
            withCredentials: true, // Crucial for sending the auth token cookie over Cross-Origin
        });

        socketRef.current.on('connect', () => {
            console.log("Connected to AI Service successfully.");
        });

        socketRef.current.on('connect_error', (err) => {
            console.error("Socket Error:", err.message);
            if (err.message.includes("Authentication")) {
                toast.error("AI Assistant Authentication Failed. Please log in again.");
            }
        });

        socketRef.current.on('ai_response', (data) => {
            setIsTyping(false);
            if (data && data.message) {
                setMessages(prev => [...prev, { role: 'ai', content: data.message, doctors: data.doctors }]);
            }
        });

        socketRef.current.on('ai_error', (data) => {
            setIsTyping(false);
            toast.error(data.error || "An error occurred with the AI.");
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [token]);

    const handleSend = () => {
        if (!input.trim()) return;
        if (!token) {
            toast.error("Please login to use AI Triage.");
            navigate('/login');
            return;
        }

        const newMsg = { role: 'user', content: input };
        // Immediately add to screen
        setMessages(prev => [...prev, newMsg]);
        setInput('');
        setIsTyping(true);

        // Emit to AI Service memory
        socketRef.current.emit('user_message', {
            messages: [newMsg]
        });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    if (!token) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h2 className="text-2xl font-medium text-gray-700 mb-4">Please log in to use AI Triage</h2>
                <button onClick={() => navigate('/login')} className="bg-[#000B6D] text-white px-8 py-3 rounded-full">Go to Login</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto my-8 border rounded-lg shadow-sm bg-white overflow-hidden flex flex-col h-[85vh]">
            
            {/* Header */}
            <div className="bg-[#000B6D] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
                        ✨
                    </div>
                    <div>
                        <h2 className="font-medium text-lg">DocPulse AI Triage Assistant</h2>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-4 rounded-xl shadow-sm text-sm ${msg.role === 'user' ? 'bg-[#000B6D] text-white rounded-tr-none' : 'bg-white border text-gray-800 rounded-tl-none'}`}>
                            {msg.role === 'ai' ? (
                                <>
                                    <div className="prose prose-sm max-w-none text-gray-800">
                                        <ReactMarkdown>
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                    {msg.doctors && msg.doctors.length > 0 && (
                                        <div className="mt-4 flex flex-col gap-2 border-t pt-3">
                                            <p className="font-semibold text-sm text-[#000B6D]">Recommended Specialists:</p>
                                            {msg.doctors.map((doc, dIdx) => (
                                                <div key={dIdx} className="flex items-center justify-between bg-blue-50 border border-blue-100 p-3 rounded-lg shadow-sm mt-1">
                                                    <div>
                                                        <p className="font-semibold text-gray-800">{doc.name}</p>
                                                        <p className="text-xs text-gray-600">{doc.degree} • Fees: ${doc.fees}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate(`/appointment/${doc.id}`)}
                                                        className="bg-[#000B6D] text-white text-xs px-4 py-2 rounded-full hover:bg-blue-800 transition-colors"
                                                    >
                                                        Book
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="max-w-[75%] p-4 rounded-xl shadow-sm bg-white border text-gray-800 rounded-tl-none flex gap-1 items-center">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t flex gap-3">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Describe your symptoms..."
                    className="flex-1 border rounded-full px-5 py-3 outline-none focus:border-[#000B6D]"
                />
                <button 
                    onClick={handleSend}
                    disabled={isTyping || !input.trim()}
                    className={`px-8 py-3 rounded-full text-white font-medium transition-all ${isTyping || !input.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#000B6D] hover:bg-blue-900'}`}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatBot;
