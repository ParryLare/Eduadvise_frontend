import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CounselorCard from "../components/CounselorCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Search, Filter, X, SlidersHorizontal, Users } from "lucide-react";

const BrowseCounselors = () => {
  const { user } = useAuth();
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedCounselors, setSavedCounselors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    specialization: "",
    language: "",
    minRating: 0,
    sortBy: "rating",
  });
  const [priceRange, setPriceRange] = useState([0, 500]);

  const specializations = ["USA", "UK", "Canada", "Australia", "Germany", "Europe", "Singapore"];
  const languages = ["English", "Spanish", "Mandarin", "Hindi", "German", "French", "Korean", "Portuguese"];

  useEffect(() => {
    fetchCounselors();
    if (user) fetchSavedCounselors();
  }, [filters]);

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.specialization) params.append("specialization", filters.specialization);
      if (filters.language) params.append("language", filters.language);
      if (filters.minRating) params.append("min_rating", filters.minRating);
      if (priceRange[0] > 0) params.append("min_price", priceRange[0]);
      if (priceRange[1] < 500) params.append("max_price", priceRange[1]);
      params.append("sort_by", filters.sortBy);

      const res = await axios.get(`${API}/counselors?${params.toString()}`);
      setCounselors(res.data);
    } catch (err) {
      toast.error("Failed to load counselors");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCounselors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/students/saved-counselors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedCounselors(res.data.map(c => c.counselor_id));
    } catch (err) {
      // Ignore - user might not have a student profile
    }
  };

  const handleSave = async (counselorId) => {
    if (!user) {
      toast.error("Please login to save counselors");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const isSaved = savedCounselors.includes(counselorId);

      if (isSaved) {
        await axios.delete(`${API}/students/saved-counselors/${counselorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedCounselors(prev => prev.filter(id => id !== counselorId));
        toast.success("Counselor removed from saved");
      } else {
        await axios.post(`${API}/students/saved-counselors/${counselorId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSavedCounselors(prev => [...prev, counselorId]);
        toast.success("Counselor saved!");
      }
    } catch (err) {
      toast.error("Failed to update saved counselors");
    }
  };

  const clearFilters = () => {
    setFilters({ specialization: "", language: "", minRating: 0, sortBy: "rating" });
    setPriceRange([0, 500]);
  };

  const activeFiltersCount = [
    filters.specialization,
    filters.language,
    filters.minRating > 0,
    priceRange[0] > 0 || priceRange[1] < 500
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-sand-50" data-testid="browse-counselors">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-teal-800 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-8 h-8" />
            <h1 className="font-heading text-4xl md:text-5xl font-bold">Find Your Counselor</h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl">
            Connect with certified counselors who specialize in your target countries and programs.
          </p>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-20 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4 flex-1">
              <Select value={filters.specialization} onValueChange={(v) => setFilters(prev => ({ ...prev, specialization: v }))}>
                <SelectTrigger className="w-40" data-testid="filter-specialization">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {specializations.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.language} onValueChange={(v) => setFilters(prev => ({ ...prev, language: v }))}>
                <SelectTrigger className="w-40" data-testid="filter-language">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.minRating?.toString() || "0"} onValueChange={(v) => setFilters(prev => ({ ...prev, minRating: parseFloat(v) }))}>
                <SelectTrigger className="w-32" data-testid="filter-rating">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(v) => setFilters(prev => ({ ...prev, sortBy: v }))}>
                <SelectTrigger className="w-40" data-testid="filter-sort">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="experience">Most Experienced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Filter Button */}
            <Button 
              variant="outline" 
              className="md:hidden flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge className="bg-teal-700 text-white ml-1">{activeFiltersCount}</Badge>
              )}
            </Button>

            {/* Results Count & Clear */}
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-muted-foreground text-sm">
                {counselors.length} counselors found
              </span>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-teal-700">
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="md:hidden mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <Select value={filters.specialization} onValueChange={(v) => setFilters(prev => ({ ...prev, specialization: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {specializations.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.language} onValueChange={(v) => setFilters(prev => ({ ...prev, language: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.sortBy} onValueChange={(v) => setFilters(prev => ({ ...prev, sortBy: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* Counselors Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-96 animate-pulse" />
              ))}
            </div>
          ) : counselors.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold mb-2">No Counselors Found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters to find counselors.</p>
              <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {counselors.map((counselor) => (
                <CounselorCard 
                  key={counselor.counselor_id} 
                  counselor={counselor}
                  onSave={user ? handleSave : null}
                  isSaved={savedCounselors.includes(counselor.counselor_id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-teal-700 text-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-heading text-3xl font-bold mb-4">Are You a Counselor?</h2>
          <p className="text-white/80 mb-6">Join our platform and help students achieve their dreams of studying abroad.</p>
          <Link to="/counselor/apply">
            <Button className="bg-white text-teal-700 hover:bg-white/90" data-testid="become-counselor-btn">
              Become a Counselor
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BrowseCounselors;
