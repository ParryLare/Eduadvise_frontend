import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "sonner";
import { 
  MessageCircle, X, User, ChevronRight, Circle
} from "lucide-react";

const ConversationsList = ({ onSelectConversation, selectedId }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) { // Less than 24 hours
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diff < 604800000) { // Less than 7 days
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground">Start a conversation with a counselor</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="p-2 space-y-1">
        {conversations.map((conv) => {
          const otherUser = conv.other_user || {};
          const isSelected = selectedId === conv.conversation_id;
          
          return (
            <button
              key={conv.conversation_id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                isSelected ? 'bg-teal-50 border border-teal-200' : 'hover:bg-muted'
              }`}
              data-testid={`conversation-${conv.conversation_id}`}
            >
              {otherUser.picture || conv.other_counselor?.photo ? (
                <img 
                  src={otherUser.picture || conv.other_counselor?.photo} 
                  alt="" 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-700" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold truncate">
                    {otherUser.first_name} {otherUser.last_name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(conv.last_message_time)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.last_message || "No messages yet"}
                  </p>
                  {conv.unread_count > 0 && (
                    <Badge className="bg-teal-700 text-white text-xs ml-2">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ConversationsList;
