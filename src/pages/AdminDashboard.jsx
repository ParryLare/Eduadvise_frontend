import { useState, useEffect } from "react";
import axios from "axios";
import { API, useAuth } from "../App";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { 
  Users, GraduationCap, Calendar, Building, TrendingUp, 
  CheckCircle, XCircle, Clock, Eye, Shield
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [pendingCounselors, setPendingCounselors] = useState([]);
  const [allCounselors, setAllCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, counselor: null });
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [analyticsRes, pendingRes, allRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, { headers }),
        axios.get(`${API}/admin/pending-counselors`, { headers }),
        axios.get(`${API}/admin/all-counselors`, { headers })
      ]);

      setAnalytics(analyticsRes.data);
      setPendingCounselors(pendingRes.data);
      setAllCounselors(allRes.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const updateCounselorStatus = async (counselorId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/counselors/${counselorId}/status`, 
        { status, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Counselor ${status}`);
      setReviewModal({ open: false, counselor: null });
      setFeedback("");
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
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

  return (
    <div className="min-h-screen bg-sand-50" data-testid="admin-dashboard">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-teal-700" />
            <div>
              <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage counselors, students, and platform content</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-teal-700" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{analytics?.total_students || 0}</p>
                  <p className="text-sm text-muted-foreground">Students</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-terracotta-100 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-terracotta-700" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{analytics?.approved_counselors || 0}</p>
                  <p className="text-sm text-muted-foreground">Counselors</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{analytics?.pending_counselors || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-coral-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-coral-600" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold">{analytics?.total_bookings || 0}</p>
                  <p className="text-sm text-muted-foreground">Bookings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="pending">
                Pending Applications
                {pendingCounselors.length > 0 && (
                  <Badge className="ml-2 bg-amber-500">{pendingCounselors.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="counselors">All Counselors</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            {/* Pending Applications */}
            <TabsContent value="pending">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-4">
                  Pending Counselor Applications
                </h2>

                {pendingCounselors.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-muted-foreground">No pending applications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingCounselors.map((counselor) => (
                      <div 
                        key={counselor.counselor_id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-sand-50 rounded-xl"
                      >
                        <div className="flex items-center gap-4">
                          {counselor.photo ? (
                            <img src={counselor.photo} alt="" className="w-16 h-16 rounded-xl object-cover" />
                          ) : (
                            <div className="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center">
                              <Users className="w-8 h-8 text-teal-700" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-lg">
                              {counselor.user?.first_name} {counselor.user?.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{counselor.credentials}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {counselor.specializations?.slice(0, 3).map((spec) => (
                                <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setReviewModal({ open: true, counselor })}
                            data-testid={`review-${counselor.counselor_id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                          <Button 
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updateCounselorStatus(counselor.counselor_id, 'approved')}
                            data-testid={`approve-${counselor.counselor_id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300"
                            onClick={() => updateCounselorStatus(counselor.counselor_id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* All Counselors */}
            <TabsContent value="counselors">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-4">
                  All Counselors ({allCounselors.length})
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold">Counselor</th>
                        <th className="text-left py-3 px-4 font-semibold">Specializations</th>
                        <th className="text-left py-3 px-4 font-semibold">Rating</th>
                        <th className="text-left py-3 px-4 font-semibold">Sessions</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCounselors.map((counselor) => (
                        <tr key={counselor.counselor_id} className="border-b border-border">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {counselor.photo ? (
                                <img src={counselor.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded-full" />
                              )}
                              <div>
                                <p className="font-medium">{counselor.user?.first_name} {counselor.user?.last_name}</p>
                                <p className="text-xs text-muted-foreground">{counselor.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {counselor.specializations?.slice(0, 2).map((spec) => (
                                <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">{counselor.rating?.toFixed(1) || '-'}</span>
                            <span className="text-muted-foreground text-sm"> ({counselor.total_reviews})</span>
                          </td>
                          <td className="py-3 px-4">{counselor.total_sessions}</td>
                          <td className="py-3 px-4">
                            <Badge className={
                              counselor.status === 'approved' ? 'bg-green-100 text-green-700' :
                              counselor.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              counselor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }>
                              {counselor.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {counselor.status === 'approved' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => updateCounselorStatus(counselor.counselor_id, 'suspended')}
                              >
                                Suspend
                              </Button>
                            )}
                            {counselor.status === 'suspended' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="text-green-600"
                                onClick={() => updateCounselorStatus(counselor.counselor_id, 'approved')}
                              >
                                Reactivate
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Overview */}
            <TabsContent value="overview">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-700" />
                    Platform Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-sand-50 rounded-lg">
                      <span>Total Students</span>
                      <span className="font-bold">{analytics?.total_students || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-sand-50 rounded-lg">
                      <span>Total Counselors</span>
                      <span className="font-bold">{analytics?.total_counselors || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-sand-50 rounded-lg">
                      <span>Approved Counselors</span>
                      <span className="font-bold">{analytics?.approved_counselors || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-sand-50 rounded-lg">
                      <span>Total Bookings</span>
                      <span className="font-bold">{analytics?.total_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-sand-50 rounded-lg">
                      <span>Completed Sessions</span>
                      <span className="font-bold">{analytics?.completed_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-sand-50 rounded-lg">
                      <span>Universities Listed</span>
                      <span className="font-bold">{analytics?.total_universities || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-terracotta-700" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <GraduationCap className="w-4 h-4 mr-2" />
                      Manage Universities
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="w-4 h-4 mr-2" />
                      View All Students
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      View All Bookings
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModal.open} onOpenChange={(open) => setReviewModal({ ...reviewModal, open })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          
          {reviewModal.counselor && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {reviewModal.counselor.photo ? (
                  <img src={reviewModal.counselor.photo} alt="" className="w-20 h-20 rounded-xl object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-teal-100 rounded-xl flex items-center justify-center">
                    <Users className="w-10 h-10 text-teal-700" />
                  </div>
                )}
                <div>
                  <h3 className="font-heading text-xl font-bold">
                    {reviewModal.counselor.user?.first_name} {reviewModal.counselor.user?.last_name}
                  </h3>
                  <p className="text-muted-foreground">{reviewModal.counselor.user?.email}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-sand-50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Credentials</p>
                  <p className="font-medium">{reviewModal.counselor.credentials}</p>
                </div>
                <div className="bg-sand-50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{reviewModal.counselor.experience_years} years</p>
                </div>
              </div>

              <div className="bg-sand-50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {reviewModal.counselor.specializations?.map((spec) => (
                    <Badge key={spec}>{spec}</Badge>
                  ))}
                </div>
              </div>

              <div className="bg-sand-50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Languages</p>
                <div className="flex flex-wrap gap-2">
                  {reviewModal.counselor.languages?.map((lang) => (
                    <Badge key={lang} variant="outline">{lang}</Badge>
                  ))}
                </div>
              </div>

              <div className="bg-sand-50 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-2">Bio</p>
                <p className="text-sm">{reviewModal.counselor.bio}</p>
              </div>

              <div>
                <label className="text-sm font-medium">Feedback (Optional)</label>
                <Textarea
                  placeholder="Add feedback for the counselor..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewModal({ open: false, counselor: null })}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              className="text-red-600 border-red-300"
              onClick={() => updateCounselorStatus(reviewModal.counselor?.counselor_id, 'rejected')}
            >
              Reject
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => updateCounselorStatus(reviewModal.counselor?.counselor_id, 'approved')}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
