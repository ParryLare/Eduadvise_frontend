import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { 
  BookOpen, FileText, Globe, ChevronRight, Download, 
  Clock, Eye, Tag, Newspaper
} from "lucide-react";

const Resources = () => {
  const [guides, setGuides] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const [guidesRes, blogsRes] = await Promise.all([
        axios.get(`${API}/guides`),
        axios.get(`${API}/blog`)
      ]);
      setGuides(guidesRes.data);
      setBlogs(blogsRes.data);
    } catch (err) {
      toast.error("Failed to load resources");
    } finally {
      setLoading(false);
    }
  };

  const countryFlags = {
    'USA': '🇺🇸',
    'UK': '🇬🇧',
    'CANADA': '🇨🇦',
    'AUSTRALIA': '🇦🇺',
    'GERMANY': '🇩🇪',
  };

  return (
    <div className="min-h-screen bg-sand-50" data-testid="resources-page">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-teal-800 via-teal-700 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <h1 className="font-heading text-4xl md:text-5xl font-bold">Resources Hub</h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl">
            Everything you need to know about studying abroad — guides, templates, tips, and more.
          </p>
        </div>
      </section>

      {/* Country Guides */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-teal-700 font-semibold uppercase tracking-wider text-sm">Step-by-Step</span>
              <h2 className="font-heading text-3xl font-bold mt-2">Application Guides</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-48 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guides.map((guide) => (
                <Link 
                  key={guide.guide_id}
                  to={`/resources/guides/${guide.country.toLowerCase()}`}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border hover:border-teal-200"
                  data-testid={`guide-${guide.country.toLowerCase()}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{countryFlags[guide.country] || '🌍'}</div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-xl mb-2 group-hover:text-teal-700 transition-colors">
                        Study in {guide.country}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {guide.title}
                      </p>
                      <div className="flex items-center text-teal-700 font-semibold text-sm">
                        Read Guide
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Document Templates */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-terracotta-700 font-semibold uppercase tracking-wider text-sm">Templates</span>
              <h2 className="font-heading text-3xl font-bold mt-2">Document Templates</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Statement of Purpose", description: "Template for writing a compelling SOP", icon: FileText },
              { title: "Letter of Recommendation", description: "Guidelines for LOR requests", icon: FileText },
              { title: "Student CV Template", description: "Academic CV format for applications", icon: FileText },
              { title: "Scholarship Essay", description: "Sample scholarship application essay", icon: FileText },
            ].map((template, i) => (
              <div 
                key={i}
                className="bg-sand-50 rounded-2xl p-6 hover:bg-teal-50 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors">
                  <template.icon className="w-6 h-6 text-teal-700" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{template.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{template.description}</p>
                <button className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-coral-500 font-semibold uppercase tracking-wider text-sm">Latest Articles</span>
              <h2 className="font-heading text-3xl font-bold mt-2">From Our Blog</h2>
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <article 
                  key={post.post_id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-40 bg-gradient-to-br from-teal-100 to-terracotta-100 flex items-center justify-center">
                    <Newspaper className="w-12 h-12 text-teal-600/50" />
                  </div>
                  <div className="p-6">
                    <Badge className="mb-3">{post.category}</Badge>
                    <h3 className="font-heading font-bold text-lg mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views}
                      </span>
                      <span>{post.author}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Interactive Tools */}
      <section className="py-16 bg-gradient-to-br from-teal-700 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <span className="text-coral-400 font-semibold uppercase tracking-wider text-sm">Coming Soon</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mt-2">Interactive Tools</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "University Compare", description: "Compare up to 3 universities side by side", icon: Globe },
              { title: "Budget Calculator", description: "Estimate costs for different countries", icon: FileText },
              { title: "GPA Converter", description: "Convert grades between systems", icon: FileText },
              { title: "Program Finder Quiz", description: "Find programs matching your interests", icon: FileText },
            ].map((tool, i) => (
              <div 
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <tool.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-lg mb-2">{tool.title}</h3>
                <p className="text-white/70 text-sm">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Resources;
