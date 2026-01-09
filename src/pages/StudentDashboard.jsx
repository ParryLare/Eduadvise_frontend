import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import Navbar from "../components/Navbar";
import ChatWidget from "../components/ChatWidget";
import VideoCall from "../components/VideoCall";
import ConversationsList from "../components/ConversationsList";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { 
  Calendar, Clock, Star, User, Heart, BookOpen, 
  CheckCircle, XCircle, MessageSquare, ChevronRight, 
  Video, Phone, MessageCircle
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [savedCounselors, setSavedCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, booking: null });
  const [reviewData, setReviewData] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  
  // Chat and Call state
  const [activeChat, setActiveChat] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchData();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    if (!user) return;
    
    const wsUrl = process.env.REACT_APP_BACKEND_URL.replace('https://', 'wss://').replace('http://', 'ws://');
    const ws = new WebSocket(`${wsUrl}/ws/${user.user_id}`);
    
    ws.onopen = () => {
      console.log("Dashboard WebSocket connected");
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "incoming_call") {
        setIncomingCall({
          callId: data.call.call_id,
          bookingId: data.call.booking_id,
          callType: data.call.call_type,
          callerName: `${data.caller.first_name} ${data.caller.last_name}`,
          callerPhoto: data.caller.picture
        });
      }
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    wsRef.current = ws;
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [bookingsRes, savedRes] = await Promise.all([
        axios.get(`${API}/bookings/student`, { headers }),
        axios.get(`${API}/students/saved-counselors`, { headers })
      ]);

      setBookings(bookingsRes.data);
      setSavedCounselors(savedRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API}/bookings/${reviewModal.booking.booking_id}/review`, {
        booking_id: reviewModal.booking.booking_id,
        rating: reviewData.rating,
        comment: reviewData.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Review submitted!");
      setReviewModal({ open: false, booking: null });
      setReviewData({ rating: 5, comment: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const upcomingBookings = bookings.filter(b => 
    b.status === 'confirmed' || b.status === 'pending'
  );
  const pastBookings = bookings.filter(b => 
    b.status === 'completed' || b.status === 'cancelled'
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-sand-50" data-testid="student-dashboard">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold">
                Welcome back, {user?.first_name}!
              </h1>
              <p className="text-muted-foreground">Manage your sessions and explore counselors</p>
            </div>
            <Link to="/counselors">
              <Button className="btn-primary">
                Find Counselors
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{upcomingBookings.length}</p>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-terracotta-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-terracotta-700" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">
                    {pastBookings.filter(b => b.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-coral-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-coral-500" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{savedCounselors.length}</p>
                  <p className="text-sm text-muted-foreground">Saved</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">
                    {pastBookings.filter(b => b.review).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="sessions" className="space-y-6">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="sessions">My Sessions</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="saved">Saved Counselors</TabsTrigger>
            </TabsList>

            <TabsContent value="sessions" className="space-y-6">
              {/* Upcoming Sessions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-700" />
                  Upcoming Sessions
                </h2>

                {loading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No upcoming sessions</p>
                    <Link to="/counselors">
                      <Button variant="link" className="text-teal-700">Book your first session</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div 
                        key={booking.booking_id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-sand-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          {booking.counselor?.photo ? (
                            <img src={booking.counselor.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
                          ) : (
                            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-teal-700" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">
                              {booking.counselor?.user?.first_name} {booking.counselor?.user?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{booking.service?.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(booking.date_time)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTime(booking.date_time)}
                            </span>
                          </div>
                          <Badge className={booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                            {booking.status}
                          </Badge>
                          {/* Communication buttons for confirmed bookings */}
                          {booking.status === 'confirmed' && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setActiveChat({
                                  otherUserId: booking.counselor?.user_id,
                                  otherUserName: `${booking.counselor?.user?.first_name} ${booking.counselor?.user?.last_name}`,
                                  otherUserPhoto: booking.counselor?.photo,
                                  bookingId: booking.booking_id
                                })}
                                data-testid={`chat-btn-${booking.booking_id}`}
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Chat
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-teal-700 hover:bg-teal-600"
                                onClick={() => setActiveCall({
                                  bookingId: booking.booking_id,
                                  callType: 'video',
                                  otherUserName: `${booking.counselor?.user?.first_name} ${booking.counselor?.user?.last_name}`,
                                  otherUserPhoto: booking.counselor?.photo
                                })}
                                data-testid={`video-call-btn-${booking.booking_id}`}
                              >
                                <Video className="w-4 h-4 mr-1" />
                                Video Call
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Sessions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-terracotta-700" />
                  Past Sessions
                </h2>

                {pastBookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No past sessions</p>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <div 
                        key={booking.booking_id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          {booking.counselor?.photo ? (
                            <img src={booking.counselor.photo} alt="" className="w-14 h-14 rounded-full object-cover" />
                          ) : (
                            <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">
                              {booking.counselor?.user?.first_name} {booking.counselor?.user?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{booking.service?.name}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(booking.date_time)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={booking.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                            {booking.status}
                          </Badge>
                          {booking.status === 'completed' && !booking.review && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setReviewModal({ open: true, booking })}
                              data-testid={`review-btn-${booking.booking_id}`}
                            >
                              <Star className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          )}
                          {booking.review && (
                            <div className="flex items-center gap-1">
                              {[...Array(booking.review.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-teal-700" />
                  Messages
                </h2>
                <ConversationsList 
                  onSelectConversation={(conv) => setActiveChat({
                    otherUserId: conv.other_user?.user_id,
                    otherUserName: `${conv.other_user?.first_name} ${conv.other_user?.last_name}`,
                    otherUserPhoto: conv.other_user?.picture || conv.other_counselor?.photo,
                    bookingId: null
                  })}
                  selectedId={null}
                />
              </div>
            </TabsContent>

            <TabsContent value="saved">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-coral-500" />
                  Saved Counselors
                </h2>

                {savedCounselors.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No saved counselors</p>
                    <Link to="/counselors">
                      <Button variant="link" className="text-teal-700">Browse counselors</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {savedCounselors.map((counselor) => (
                      <Link 
                        key={counselor.counselor_id}
                        to={`/counselors/${counselor.counselor_id}`}
                        className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-teal-300 transition-colors"
                      >
                        {counselor.photo ? (
                          <img src={counselor.photo} alt="" className="w-16 h-16 rounded-xl object-cover" />
                        ) : (
                          <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center">
                            <User className="w-8 h-8 text-teal-700" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{counselor.user?.first_name} {counselor.user?.last_name}</p>
                          <p className="text-sm text-muted-foreground">{counselor.specializations?.slice(0, 2).join(', ')}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-medium">{counselor.rating?.toFixed(1)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModal.open} onOpenChange={(open) => setReviewModal({ ...reviewModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="focus:outline-none"
                  >
                    <Star 
                      className={`w-8 h-8 ${star <= reviewData.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Review</label>
              <Textarea
                placeholder="Share your experience..."
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModal({ open: false, booking: null })}>
              Cancel
            </Button>
            <Button className="btn-primary" onClick={submitReview} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Widget */}
      {activeChat && (
        <ChatWidget
          otherUserId={activeChat.otherUserId}
          otherUserName={activeChat.otherUserName}
          otherUserPhoto={activeChat.otherUserPhoto}
          bookingId={activeChat.bookingId}
          onStartCall={(callType) => setActiveCall({
            bookingId: activeChat.bookingId,
            callType,
            otherUserName: activeChat.otherUserName,
            otherUserPhoto: activeChat.otherUserPhoto
          })}
        />
      )}

      {/* Active Video/Voice Call */}
      {activeCall && (
        <VideoCall
          callId={activeCall.callId}
          bookingId={activeCall.bookingId}
          callType={activeCall.callType}
          otherUserName={activeCall.otherUserName}
          otherUserPhoto={activeCall.otherUserPhoto}
          isIncoming={false}
          onEnd={() => setActiveCall(null)}
        />
      )}

      {/* Incoming Call */}
      {incomingCall && (
        <VideoCall
          callId={incomingCall.callId}
          bookingId={incomingCall.bookingId}
          callType={incomingCall.callType}
          otherUserName={incomingCall.callerName}
          otherUserPhoto={incomingCall.callerPhoto}
          isIncoming={true}
          onEnd={() => setIncomingCall(null)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
