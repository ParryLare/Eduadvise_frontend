import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { 
  Star, Clock, Languages, Award, Linkedin, Calendar as CalendarIcon,
  ChevronRight, Heart, MessageSquare, Video, CheckCircle
} from "lucide-react";

const CounselorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [counselor, setCounselor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const availableTimes = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"
  ];

  useEffect(() => {
    fetchCounselor();
  }, [id]);

  const fetchCounselor = async () => {
    try {
      const res = await axios.get(`${API}/counselors/${id}`);
      setCounselor(res.data);
    } catch (err) {
      toast.error("Counselor not found");
      navigate("/counselors");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please login to book a session");
      navigate("/login");
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    try {
      setBookingLoading(true);
      const token = localStorage.getItem("token");
      
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      await axios.post(`${API}/bookings`, {
        counselor_id: counselor.counselor_id,
        service_id: selectedService.service_id,
        date_time: dateTime.toISOString(),
        student_notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Booking request sent! The counselor will confirm soon.");
      setBookingOpen(false);
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime("");
      setNotes("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create booking");
    } finally {
      setBookingLoading(false);
    }
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

  if (!counselor) return null;

  const userInfo = counselor.user || {};

  return (
    <div className="min-h-screen bg-sand-50" data-testid="counselor-profile">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-teal-800 to-teal-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="relative">
              {counselor.photo ? (
                <img 
                  src={counselor.photo} 
                  alt={`${userInfo.first_name} ${userInfo.last_name}`}
                  className="w-40 h-40 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-white shadow-xl"
                />
              ) : (
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-teal-600 border-4 border-white shadow-xl flex items-center justify-center">
                  <span className="text-5xl text-white font-heading font-bold">
                    {userInfo.first_name?.[0]}{userInfo.last_name?.[0]}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-3 -right-3 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="font-bold">{counselor.rating?.toFixed(1)}</span>
                <span className="text-muted-foreground text-sm">({counselor.total_reviews})</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-white">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
                {userInfo.first_name} {userInfo.last_name}
              </h1>
              <p className="text-xl text-white/80 mb-4">{counselor.credentials}</p>

              <div className="flex flex-wrap gap-4 mb-6">
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Clock className="w-5 h-5" />
                  {counselor.experience_years} years experience
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Languages className="w-5 h-5" />
                  {counselor.languages?.join(", ")}
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Video className="w-5 h-5" />
                  {counselor.total_sessions}+ sessions
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {counselor.specializations?.map((spec) => (
                  <Badge key={spec} className="bg-coral-400 text-white border-0 px-4 py-1">
                    {spec}
                  </Badge>
                ))}
              </div>

              {counselor.linkedin_url && (
                <a 
                  href={counselor.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn Profile
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - About & Reviews */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{counselor.bio}</p>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6">
                  Reviews ({counselor.reviews?.length || 0})
                </h2>
                
                {counselor.reviews?.length > 0 ? (
                  <div className="space-y-6">
                    {counselor.reviews.map((review) => (
                      <div key={review.review_id} className="border-b border-border pb-6 last:border-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-teal-700">
                                {review.student_name?.[0] || "S"}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold">{review.student_name || "Student"}</p>
                              <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                )}
              </div>
            </div>

            {/* Right Column - Services */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
                <h2 className="font-heading text-xl font-bold mb-4">Services</h2>
                
                <div className="space-y-4">
                  {counselor.services?.map((service) => (
                    <div 
                      key={service.service_id}
                      className="border border-border rounded-xl p-4 hover:border-teal-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{service.name}</h3>
                        <span className="font-heading font-bold text-teal-700">${service.price}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration} min
                        </span>
                        <Button 
                          size="sm" 
                          className="btn-primary py-2"
                          onClick={() => {
                            setSelectedService(service);
                            setBookingOpen(true);
                          }}
                          data-testid={`book-service-${service.service_id}`}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl">Book Session</DialogTitle>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-6">
              {/* Service Summary */}
              <div className="bg-sand-50 rounded-xl p-4">
                <h3 className="font-semibold">{selectedService.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedService.duration} min
                  </span>
                  <span className="font-heading font-bold text-teal-700">${selectedService.price}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border mx-auto"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Time</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger data-testid="select-time">
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">Notes for Counselor (Optional)</label>
                <Textarea 
                  placeholder="Share any questions or topics you'd like to discuss..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="btn-primary"
              onClick={handleBooking}
              disabled={bookingLoading || !selectedDate || !selectedTime}
              data-testid="confirm-booking"
            >
              {bookingLoading ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CounselorProfile;
