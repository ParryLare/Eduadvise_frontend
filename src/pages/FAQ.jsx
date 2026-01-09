import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Input } from "../components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Search, HelpCircle, MessageCircle, Mail } from "lucide-react";

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["Planning", "Tests", "Finance", "Work", "Application", "Visa", "Career"];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${API}/faq`);
      setFaqs(res.data);
    } catch (err) {
      toast.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = search === "" || 
      faq.question.toLowerCase().includes(search.toLowerCase()) ||
      faq.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-sand-50" data-testid="faq-page">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-br from-terracotta-700 to-terracotta-800 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-8 h-8" />
            <h1 className="font-heading text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-xl text-white/80 max-w-2xl mb-8">
            Find answers to common questions about studying abroad.
          </p>

          {/* Search */}
          <div className="max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search your question..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-full bg-white text-foreground"
              data-testid="faq-search"
            />
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="py-8 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-wrap gap-3">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-teal-700 hover:bg-teal-600" : ""}
            >
              All Topics
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "bg-teal-700 hover:bg-teal-600" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-heading text-2xl font-bold mb-2">No Results Found</h3>
              <p className="text-muted-foreground mb-4">Try a different search term or category.</p>
              <Button onClick={() => { setSearch(""); setSelectedCategory("all"); }} variant="outline">
                Clear Filters
              </Button>
            </div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFaqs.map((faq) => (
                <AccordionItem 
                  key={faq.faq_id} 
                  value={faq.faq_id}
                  className="bg-white rounded-xl border border-border px-6 data-[state=open]:shadow-lg transition-shadow"
                >
                  <AccordionTrigger className="py-6 text-left hover:no-underline">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="shrink-0">{faq.category}</Badge>
                      <span className="font-heading font-semibold text-lg">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-teal-50">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <MessageCircle className="w-12 h-12 text-teal-700 mx-auto mb-4" />
          <h2 className="font-heading text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Can't find what you're looking for? Our expert counselors are here to help with personalized guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/counselors">
              <Button className="btn-primary">Talk to a Counselor</Button>
            </Link>
            <Button variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;
