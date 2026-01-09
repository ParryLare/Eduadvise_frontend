import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API, useAuth } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { 
  MessageCircle, Send, X, Minimize2, Maximize2, 
  Phone, Video, User, Check, CheckCheck, Paperclip, 
  FileText, Image as ImageIcon, Download
} from "lucide-react";

const ChatWidget = ({ otherUserId, otherUserName, otherUserPhoto, onStartCall, bookingId }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user && otherUserId) {
      initializeChat();
      connectWebSocket();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen, user, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Get or create conversation
      const convRes = await axios.get(`${API}/chat/conversations/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversationId(convRes.data.conversation_id);
      
      // Get messages
      const msgRes = await axios.get(`${API}/chat/messages/${convRes.data.conversation_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(msgRes.data);
    } catch (err) {
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!user) return;
    
    const wsUrl = process.env.REACT_APP_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/ws/${user.user_id}`);
    
    ws.onopen = () => {
      console.log("WebSocket connected");
      if (conversationId) {
        ws.send(JSON.stringify({ type: "join_conversation", conversation_id: conversationId }));
      }
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "new_message" && data.message.sender_id === otherUserId) {
        setMessages(prev => [...prev, data.message]);
      } else if (data.type === "user_typing" && data.user_id === otherUserId) {
        setOtherUserTyping(true);
      } else if (data.type === "user_stop_typing" && data.user_id === otherUserId) {
        setOtherUserTyping(false);
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };
    
    wsRef.current = ws;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/chat/messages`, {
        receiver_id: otherUserId,
        content: newMessage,
        message_type: "text"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => [...prev, res.data]);
      setNewMessage("");
      
      // Stop typing indicator
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ 
          type: "stop_typing", 
          conversation_id: conversationId 
        }));
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB");
      return;
    }
    
    // Check file type
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.txt', '.xlsx', '.xls'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      toast.error(`File type not allowed. Allowed: ${allowedExtensions.join(', ')}`);
      return;
    }
    
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await axios.post(`${API}/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const fileData = {
        file_id: uploadRes.data.file_id,
        filename: uploadRes.data.original_name,
        url: uploadRes.data.url,
        size: uploadRes.data.size,
        content_type: uploadRes.data.content_type
      };
      
      // Determine message type based on content type
      const isImage = file.type.startsWith('image/');
      
      // Send file message
      const msgRes = await axios.post(`${API}/chat/messages`, {
        receiver_id: otherUserId,
        content: file.name,
        message_type: isImage ? "image" : "file",
        file_data: fileData
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessages(prev => [...prev, msgRes.data]);
      toast.success("File sent successfully");
      
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to upload file");
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileUrl = (url) => {
    if (!url) return '';
    // If it's already a full URL, return as is
    if (url.startsWith('http')) return url;
    // Otherwise, prepend the API base URL
    const baseUrl = process.env.REACT_APP_BACKEND_URL;
    return `${baseUrl}${url}`;
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && conversationId) {
      if (!isTyping) {
        setIsTyping(true);
        wsRef.current.send(JSON.stringify({ 
          type: "typing", 
          conversation_id: conversationId 
        }));
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ 
            type: "stop_typing", 
            conversation_id: conversationId 
          }));
        }
      }, 2000);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-teal-700 text-white rounded-full shadow-lg hover:bg-teal-600 transition-colors flex items-center justify-center z-50"
        data-testid="chat-toggle"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-border z-50 transition-all duration-300 ${
        isMinimized ? 'w-72 h-14' : 'w-96 h-[500px]'
      }`}
      data-testid="chat-widget"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-teal-700 text-white rounded-t-2xl">
        <div className="flex items-center gap-3">
          {otherUserPhoto ? (
            <img src={otherUserPhoto} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">{otherUserName}</p>
            {otherUserTyping && (
              <p className="text-xs text-teal-200">typing...</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {bookingId && onStartCall && (
            <>
              <button 
                onClick={() => onStartCall('voice')}
                className="p-2 hover:bg-teal-600 rounded-full transition-colors"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onStartCall('video')}
                className="p-2 hover:bg-teal-600 rounded-full transition-colors"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-teal-600 rounded-full transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-teal-600 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 h-[360px] p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageCircle className="w-12 h-12 mb-2" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user?.user_id;
                  const isImage = msg.message_type === "image";
                  const isFile = msg.message_type === "file";
                  
                  return (
                    <div 
                      key={msg.message_id}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isMe 
                            ? 'bg-teal-700 text-white rounded-br-md' 
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        {/* Image Message */}
                        {isImage && msg.file_data && (
                          <div className="mb-2">
                            <a 
                              href={getFileUrl(msg.file_data.url)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img 
                                src={getFileUrl(msg.file_data.url)} 
                                alt={msg.file_data.filename}
                                className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            </a>
                          </div>
                        )}
                        
                        {/* File Message */}
                        {isFile && msg.file_data && (
                          <a 
                            href={getFileUrl(msg.file_data.url)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 p-2 rounded-lg mb-1 ${
                              isMe ? 'bg-teal-600 hover:bg-teal-500' : 'bg-background hover:bg-muted'
                            } transition-colors`}
                          >
                            <div className={`p-2 rounded-lg ${isMe ? 'bg-teal-500' : 'bg-teal-100'}`}>
                              <FileText className={`w-5 h-5 ${isMe ? 'text-white' : 'text-teal-700'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{msg.file_data.filename}</p>
                              <p className={`text-xs ${isMe ? 'text-teal-200' : 'text-muted-foreground'}`}>
                                {formatFileSize(msg.file_data.size)}
                              </p>
                            </div>
                            <Download className={`w-4 h-4 ${isMe ? 'text-teal-200' : 'text-muted-foreground'}`} />
                          </a>
                        )}
                        
                        {/* Text Message */}
                        {msg.message_type === "text" && (
                          <p className="text-sm">{msg.content}</p>
                        )}
                        
                        {/* Timestamp */}
                        <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : ''}`}>
                          <span className={`text-xs ${isMe ? 'text-teal-200' : 'text-muted-foreground'}`}>
                            {formatTime(msg.created_at)}
                          </span>
                          {isMe && (
                            msg.read 
                              ? <CheckCheck className="w-3 h-3 text-teal-200" />
                              : <Check className="w-3 h-3 text-teal-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-border">
            <div className="flex gap-2 items-center">
              {/* File Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xlsx,.xls"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-full hover:bg-muted"
                title="Attach file"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              
              <Input
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 rounded-full"
                data-testid="chat-input"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full bg-teal-700 hover:bg-teal-600"
                disabled={!newMessage.trim()}
                data-testid="send-message-btn"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
