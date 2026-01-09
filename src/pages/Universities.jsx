import { useState, useEffect } from "react";
import axios from "axios";
import { API } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UniversityCard from "../components/UniversityCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Search, GraduationCap, MapPin, X, SlidersHorizontal } from "lucide-react";

const Universities = () => {
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    country: "",
    program: "",
    maxRanking: 0,
  });

  const countries = ["USA", "UK", "Canada", "Australia", "Germany", "Switzerland", "Singapore", "Netherlands"];
  const programs = ["Undergraduate", "Graduate", "Doctorate"];

  useEffect(() => {
    fetchUniversities();
  }, [filters]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.country) params.append("country", filters.country);
      if (filters.program) params.append("program", filters.program);
      if (filters.maxRanking) params.append("max_ranking", filters.maxRanking);
      if (search) params.append("search", search);

      const res = await axios.get(`${API}/universities?${params.toString()}`);
      setUniversities(res.data);
    } catch (err) {
      toast.error("Failed to load universities");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUniversities();
  };

  const clearFilters = () => {
    setFilters({ country: "", program: "", maxRanking: 0 });
    setSearch("");
  };

  const activeFiltersCount = [
    filters.country,
    filters.program,
    filters.maxRanking > 0,
    search
  ].filter(Boolean).length;

  // Group universities by country
  const groupedByCountry = universities.reduce((acc, uni) => {
    if (!acc[uni.country]) acc[uni.country] = [];
    acc[uni.country].push(uni);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-sand-50" data-testid="universities-page">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-12 bg-gradient-to-br from-terracotta-700 to-terracotta-800 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-8 h-8" />
            <h1 className="font-heading text-4xl md:text-5xl font-bold">University Directory</h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl mb-8">
            Explore top universities worldwide and find the perfect fit for your academic journey.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search universities, cities, or majors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 rounded-full bg-white text-foreground"
                data-testid="university-search"
              />
              <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full btn-primary">
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="sticky top-20 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Desktop Filters */}
            <div className="hidden md:flex items-center gap-4 flex-1">
              <Select value={filters.country} onValueChange={(v) => setFilters(prev => ({ ...prev, country: v }))}>
                <SelectTrigger className="w-40" data-testid="filter-country">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.program} onValueChange={(v) => setFilters(prev => ({ ...prev, program: v }))}>
                <SelectTrigger className="w-40" data-testid="filter-program">
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.maxRanking?.toString() || "0"} onValueChange={(v) => setFilters(prev => ({ ...prev, maxRanking: parseInt(v) }))}>
                <SelectTrigger className="w-40" data-testid="filter-ranking">
                  <SelectValue placeholder="Ranking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Ranking</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                  <SelectItem value="100">Top 100</SelectItem>
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
                <Badge className="bg-terracotta-700 text-white ml-1">{activeFiltersCount}</Badge>
              )}
            </Button>

            {/* Results Count & Clear */}
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-muted-foreground text-sm">
                {universities.length} universities found
              </span>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-terracotta-700">
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Filters Panel */}
          {showFilters && (
            <div className="md:hidden mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <Select value={filters.country} onValueChange={(v) => setFilters(prev => ({ ...prev, country: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.program} onValueChange={(v) => setFilters(prev => ({ ...prev, program: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {programs.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </section>

      {/* Universities Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse" />
              ))}
            </div>
          ) : universities.length === 0 ? (
            <div className="text-center py-16">
              <GraduationCap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold mb-2">No Universities Found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
              <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
            </div>
          ) : filters.country || search ? (
            // If filtered, show as grid
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {universities.map((university) => (
                <UniversityCard key={university.university_id} university={university} />
              ))}
            </div>
          ) : (
            // If not filtered, group by country
            <div className="space-y-12">
              {Object.entries(groupedByCountry).map(([country, unis]) => (
                <div key={country}>
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="w-6 h-6 text-terracotta-600" />
                    <h2 className="font-heading text-2xl font-bold">{country}</h2>
                    <Badge variant="secondary">{unis.length}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {unis.slice(0, 6).map((university) => (
                      <UniversityCard key={university.university_id} university={university} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Universities;
