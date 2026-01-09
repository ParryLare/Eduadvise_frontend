import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import Navbar from "../components/Navbar";
import ChatWidget from "../components/ChatWidget";
import VideoCall from "../components/VideoCall";
import ConversationsList from "../components/ConversationsList";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { 
  Calendar, Clock, Star, DollarSign, Users, TrendingUp,
  Plus, Edit, Trash2, CheckCircle, XCircle, User, Settings,
  Video, Phone, MessageCircle
} from "lucide-react";

const CounselorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Chat and Call state
  const [activeChat, setActiveChat] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const wsRef = useRef(null);
  
  // Service Modal
  const [serviceModal, setServiceModal] = useState({ open: false, editing: null });
  const [serviceForm, setServiceForm] = useState({
    name: "", description: "", duration: 60, price: 100, category: "Consultation"
  });

  const categories = ["Consultation", "Application Guidance", "Interview Prep", "Visa Support", "Scholarship", "Test Prep"];

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
      console.log("Counselor Dashboard WebSocket connected");
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
      } else if (data.type === "new_message") {
        // Optionally show notification
        toast.info(`New message from ${data.message.sender_id}`);
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

      const [profileRes, bookingsRes, analyticsRes] = await Promise.all([
        axios.get(`${API}/counselors/me/profile`, { headers }),
        axios.get(`${API}/bookings/counselor`, { headers }),
        axios.get(`${API}/counselors/me/analytics`, { headers })
      ]);

      setProfile(profileRes.data);
      setBookings(bookingsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/counselor/apply');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async () => {
    if (!serviceForm.name || !serviceForm.description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (serviceModal.editing) {
        await axios.put(`${API}/services/${serviceModal.editing}`, serviceForm, { headers });
        toast.success("Service updated!");
      } else {
        await axios.post(`${API}/services`, serviceForm, { headers });
        toast.success("Service created!");
      }

      setServiceModal({ open: false, editing: null });
      setServiceForm({ name: "", description: "", duration: 60, price: 100, category: "Consultation" });
      fetchData();
    } catch (err) {
      toast.error("Failed to save service");
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Service deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete service");
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/bookings/${bookingId}/status`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Booking ${status}`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update booking");
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-sand-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-muted-foreground mb-4">Profile not found</p>
          <Button onClick={() => navigate('/counselor/apply')}>Apply as Counselor</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50" data-testid="counselor-dashboard">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading text-3xl font-bold">Counselor Dashboard</h1>
                <Badge className={
                  profile.status === 'approved' ? 'bg-green-100 text-green-700' :
                  profile.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }>
                  {profile.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">Manage your services and sessions</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => {
                setServiceForm({ name: "", description: "", duration: 60, price: 100, category: "Consultation" });
                setServiceModal({ open: true, editing: null });
              }} data-testid="add-service-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>

          {/* Status Alert */}
          {profile.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
              <p className="text-amber-800">
                <strong>Application Pending:</strong> Your profile is under review. You'll be notified once approved.
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">${analytics?.total_earnings || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-terracotta-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-terracotta-700" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{analytics?.completed_sessions || 0}</p>
                  <p className="text-sm text-muted-foreground">Sessions</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{analytics?.average_rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-coral-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-coral-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{analytics?.total_reviews || 0}</p>
                  <p className="text-sm text-muted-foreground">Reviews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="bookings" className="space-y-6">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="bookings">Session Requests</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="services">My Services</TabsTrigger>
            </TabsList>

            {/* Booking Requests */}
            <TabsContent value="bookings">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Pending Requests ({pendingBookings.length})
                </h2>

                {pendingBookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <div 
                        key={booking.booking_id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-sand-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-teal-700" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {booking.student?.user?.first_name} {booking.student?.user?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{booking.service?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(booking.date_time)} at {formatTime(booking.date_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateBookingStatus(booking.booking_id, 'confirmed')}
                            data-testid={`confirm-booking-${booking.booking_id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => updateBookingStatus(booking.booking_id, 'cancelled')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Services */}
            <TabsContent value="services">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-bold">My Services</h2>
                  <Button size="sm" onClick={() => {
                    setServiceForm({ name: "", description: "", duration: 60, price: 100, category: "Consultation" });
                    setServiceModal({ open: true, editing: null });
                  }}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add New
                  </Button>
                </div>

                {profile.services?.length === 0 ? (
                  <div className="text-center py-8">
                    <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No services yet</p>
                    <Button variant="link" onClick={() => setServiceModal({ open: true, editing: null })}>
                      Create your first service
                    </Button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.services.map((service) => (
                      <div 
                        key={service.service_id}
                        className="border border-border rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{service.name}</h3>
                            <Badge variant="outline" className="mt-1">{service.category}</Badge>
                          </div>
                          <p className="font-heading font-bold text-teal-700">${service.price}</p>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration} min
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setServiceForm(service);
                                setServiceModal({ open: true, editing: service.service_id });
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => deleteService(service.service_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Upcoming Sessions */}
            <TabsContent value="upcoming">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Upcoming Sessions ({confirmedBookings.length})
                </h2>

                {confirmedBookings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No upcoming sessions</p>
                ) : (
                  <div className="space-y-4">
                    {confirmedBookings.map((booking) => (
                      <div 
                        key={booking.booking_id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-green-700" />
                          </div>
                          <div>
                            <p className="font-semibold">
                              {booking.student?.user?.first_name} {booking.student?.user?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{booking.service?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(booking.date_time)} at {formatTime(booking.date_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-green-100 text-green-700">Confirmed</Badge>
                          {/* Chat and Call buttons */}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setActiveChat({
                              otherUserId: booking.student?.user_id,
                              otherUserName: `${booking.student?.user?.first_name} ${booking.student?.user?.last_name}`,
                              otherUserPhoto: booking.student?.user?.picture,
                              bookingId: booking.booking_id
                            })}
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
                              otherUserName: `${booking.student?.user?.first_name} ${booking.student?.user?.last_name}`,
                              otherUserPhoto: booking.student?.user?.picture
                            })}
                          >
                            <Video className="w-4 h-4 mr-1" />
                            Video Call
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => updateBookingStatus(booking.booking_id, 'completed')}
                          >
                            Mark Complete
                          </Button>
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
                    otherUserPhoto: conv.other_user?.picture,
                    bookingId: null
                  })}
                  selectedId={null}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Service Modal */}
      <Dialog open={serviceModal.open} onOpenChange={(open) => setServiceModal({ ...serviceModal, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{serviceModal.editing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Service Name</Label>
              <Input
                placeholder="e.g., University Selection Consultation"
                value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select 
                value={serviceForm.category} 
                onValueChange={(v) => setServiceForm({ ...serviceForm, category: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what's included in this service..."
                value={serviceForm.description}
                onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  value={serviceForm.duration}
                  onChange={(e) => setServiceForm({ ...serviceForm, duration: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  value={serviceForm.price}
                  onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceModal({ open: false, editing: null })}>
              Cancel
            </Button>
            <Button className="btn-primary" onClick={handleServiceSubmit}>
              {serviceModal.editing ? 'Update' : 'Create'} Service
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

export default CounselorDashboard;
