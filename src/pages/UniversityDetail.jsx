import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { toast } from "sonner";
import { 
  MapPin, Trophy, ExternalLink, Calendar, DollarSign, 
  BookOpen, Building, Globe, ArrowLeft, CheckCircle
} from "lucide-react";

const UniversityDetail = () => {
  const { id } = useParams();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUniversity();
  }, [id]);

  const fetchUniversity = async () => {
    try {
      const res = await axios.get(`${API}/universities/${id}`);
      setUniversity(res.data);
    } catch (err) {
      toast.error("University not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-terracotta-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!university) return null;

  return (
    <div className="min-h-screen bg-sand-50" data-testid="university-detail">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 relative">
        {/* Cover Image */}
        <div className="h-64 md:h-80 bg-gradient-to-br from-terracotta-200 to-teal-200 relative">
          {university.cover_image && (
            <img 
              src={university.cover_image} 
              alt={university.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Back Button */}
          <Link 
            to="/universities" 
            className="absolute top-24 left-6 md:left-12 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>

        {/* University Info Card */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-24 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              {university.logo && (
                <img 
                  src={university.logo} 
                  alt="" 
                  className="w-24 h-24 object-contain bg-white rounded-xl shadow-sm p-2"
                />
              )}
              
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">
                      {university.name}
                    </h1>
                    <p className="flex items-center gap-2 text-lg text-muted-foreground">
                      <MapPin className="w-5 h-5 text-terracotta-600" />
                      {university.city}, {university.country}
                    </p>
                  </div>
                  
                  {university.ranking && (
                    <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full">
                      <Trophy className="w-5 h-5" />
                      <span className="font-bold">World Rank #{university.ranking}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mt-6">
                  {university.programs?.map((program) => (
                    <Badge key={program} className="bg-teal-100 text-teal-700 border-0 px-4 py-1.5">
                      {program}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-wrap gap-6 mt-6">
                  <a 
                    href={university.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2"
                    data-testid="visit-website"
                  >
                    <Globe className="w-5 h-5" />
                    Visit Website
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link to="/counselors">
                    <Button variant="outline" className="border-2 border-teal-700 text-teal-700 hover:bg-teal-50">
                      Find a Counselor for {university.name.split(' ')[0]}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-white shadow-sm rounded-full p-1">
              <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
              <TabsTrigger value="programs" className="rounded-full">Programs</TabsTrigger>
              <TabsTrigger value="admissions" className="rounded-full">Admissions</TabsTrigger>
              <TabsTrigger value="costs" className="rounded-full">Costs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* About */}
                <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="font-heading text-2xl font-bold mb-4 flex items-center gap-2">
                    <Building className="w-6 h-6 text-teal-700" />
                    About the University
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {university.description}
                  </p>
                </div>

                {/* Quick Facts */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <h2 className="font-heading text-xl font-bold mb-4">Quick Facts</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-teal-700" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">World Ranking</p>
                        <p className="font-semibold">#{university.ranking || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-terracotta-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-terracotta-700" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tuition Range</p>
                        <p className="font-semibold">${university.tuition_min?.toLocaleString()} - ${university.tuition_max?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-coral-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-coral-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-semibold">{university.city}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular Majors */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-terracotta-700" />
                  Popular Majors
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {university.popular_majors?.map((major) => (
                    <div key={major} className="flex items-center gap-3 p-4 bg-sand-50 rounded-xl">
                      <CheckCircle className="w-5 h-5 text-teal-600" />
                      <span className="font-medium">{major}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="programs" className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6">Available Programs</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {university.programs?.map((program) => (
                    <div key={program} className="border border-border rounded-xl p-6 hover:border-teal-300 transition-colors">
                      <h3 className="font-heading font-bold text-xl mb-2">{program}</h3>
                      <p className="text-muted-foreground text-sm">
                        {program === 'Undergraduate' && 'Bachelor\'s degree programs typically lasting 4 years'}
                        {program === 'Graduate' && 'Master\'s degree programs typically lasting 1-2 years'}
                        {program === 'Doctorate' && 'PhD and professional doctorate programs'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admissions" className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-terracotta-700" />
                  Application Deadlines
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(university.application_deadlines || {}).map(([term, deadline]) => (
                    <div key={term} className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                      <span className="font-medium capitalize">{term} Intake</span>
                      <Badge variant="outline">{deadline}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-teal-50 rounded-2xl p-8">
                <h3 className="font-heading text-xl font-bold mb-4">Need Help With Your Application?</h3>
                <p className="text-muted-foreground mb-4">
                  Our expert counselors can guide you through the application process for {university.name}.
                </p>
                <Link to="/counselors">
                  <Button className="btn-primary">Find a Counselor</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-teal-700" />
                  Estimated Costs
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                    <div>
                      <p className="font-medium">Annual Tuition</p>
                      <p className="text-sm text-muted-foreground">Varies by program</p>
                    </div>
                    <p className="font-heading font-bold text-xl text-teal-700">
                      ${university.tuition_min?.toLocaleString()} - ${university.tuition_max?.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-sand-50 rounded-xl">
                    <div>
                      <p className="font-medium">Estimated Living Costs</p>
                      <p className="text-sm text-muted-foreground">Housing, food, transport</p>
                    </div>
                    <p className="font-heading font-bold text-xl text-terracotta-700">
                      $15,000 - $25,000/year
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UniversityDetail;
