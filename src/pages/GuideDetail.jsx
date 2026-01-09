import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { 
  ArrowLeft, Calendar, FileCheck, BookOpen, Plane, 
  DollarSign, Briefcase, CheckCircle, Clock
} from "lucide-react";

const GuideDetail = () => {
  const { country } = useParams();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGuide();
  }, [country]);

  const fetchGuide = async () => {
    try {
      const res = await axios.get(`${API}/guides/${country.toUpperCase()}`);
      setGuide(res.data);
    } catch (err) {
      toast.error("Guide not found");
    } finally {
      setLoading(false);
    }
  };

  const countryFlags = {
    'usa': '🇺🇸',
    'uk': '🇬🇧',
    'canada': '🇨🇦',
    'australia': '🇦🇺',
    'germany': '🇩🇪',
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

  if (!guide) {
    return (
      <div className="min-h-screen bg-sand-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-muted-foreground mb-4">Guide not found</p>
          <Link to="/resources">
            <Button variant="outline">Back to Resources</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50" data-testid="guide-detail">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-teal-800 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Link 
            to="/resources" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resources
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{countryFlags[country.toLowerCase()] || '🌍'}</span>
            <div>
              <Badge className="bg-coral-400 text-white border-0 mb-2">Application Guide</Badge>
              <h1 className="font-heading text-4xl md:text-5xl font-bold">{guide.title}</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Timeline */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-teal-700" />
                  Application Timeline
                </h2>
                <div className="space-y-6">
                  {guide.timeline?.map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-teal-700" />
                        </div>
                        {i < guide.timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-teal-200 mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-6">
                        <p className="font-semibold text-teal-700">{item.month}</p>
                        <p className="text-muted-foreground">{item.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Documents */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-terracotta-700" />
                  Required Documents
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {guide.required_documents?.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-sand-50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tests Required */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-coral-500" />
                  Tests Required
                </h2>
                <div className="flex flex-wrap gap-3">
                  {guide.tests_required?.map((test, i) => (
                    <Badge key={i} variant="outline" className="px-4 py-2 text-base">
                      {test}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Visa Information */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <Plane className="w-6 h-6 text-teal-700" />
                  Visa Information
                </h2>
                <p className="text-muted-foreground leading-relaxed">{guide.visa_info}</p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
                <h3 className="font-heading font-bold text-lg mb-4">Quick Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-sand-50 rounded-xl">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Cost</p>
                      <p className="font-semibold">{guide.estimated_cost}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-sand-50 rounded-xl">
                    <div className="w-10 h-10 bg-terracotta-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-terracotta-700" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Post-Study Work</p>
                      <p className="font-semibold text-sm">{guide.post_study_work}</p>
                    </div>
                  </div>
                </div>

                <hr className="my-6" />

                <div className="space-y-3">
                  <Link to="/counselors">
                    <Button className="w-full btn-primary">Find a Counselor</Button>
                  </Link>
                  <Link to={`/universities?country=${guide.country}`}>
                    <Button variant="outline" className="w-full">
                      Browse {guide.country} Universities
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GuideDetail;
