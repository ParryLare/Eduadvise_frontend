import { Link } from "react-router-dom";
import { useAuth } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { 
  GraduationCap, Users, Globe, BookOpen, Star, ArrowRight, 
  CheckCircle, Play, ChevronRight, Award, Target, Zap
} from "lucide-react";

const LandingPage = () => {
  const { user } = useAuth();

  const stats = [
    { value: "10,000+", label: "Students Helped" },
    { value: "500+", label: "Expert Counselors" },
    { value: "50+", label: "Countries Covered" },
    { value: "95%", label: "Success Rate" },
  ];

  const features = [
    {
      icon: Users,
      title: "Expert Counselors",
      description: "Connect with certified counselors specializing in your target countries and programs.",
    },
    {
      icon: Globe,
      title: "Global University Database",
      description: "Access detailed information about 1000+ universities across 50+ countries.",
    },
    {
      icon: BookOpen,
      title: "Comprehensive Resources",
      description: "Step-by-step guides, document templates, and application strategies.",
    },
    {
      icon: Target,
      title: "Personalized Matching",
      description: "Find the perfect counselor based on your goals, budget, and preferences.",
    },
  ];

  const testimonials = [
    {
      name: "Priya M.",
      country: "India → USA",
      university: "MIT",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      quote: "EduAdvise helped me navigate the complex US application process. My counselor was incredibly supportive throughout my MIT journey.",
    },
    {
      name: "Wei L.",
      country: "China → UK",
      university: "Oxford",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      quote: "The application guides and essay review services were game-changers. I couldn't have done it without my counselor's expertise.",
    },
    {
      name: "Carlos R.",
      country: "Brazil → Canada",
      university: "UBC",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      quote: "From university selection to visa approval, EduAdvise was with me every step. Highly recommend!",
    },
  ];

  const howItWorks = [
    { step: "01", title: "Create Your Profile", description: "Tell us about your goals, target countries, and academic background." },
    { step: "02", title: "Find Your Counselor", description: "Browse expert counselors and find the perfect match for your needs." },
    { step: "03", title: "Book Sessions", description: "Schedule consultations and get personalized guidance." },
    { step: "04", title: "Achieve Your Dreams", description: "Get accepted to your dream university with expert support." },
  ];

  return (
    <div className="min-h-screen bg-sand-50" data-testid="landing-page">
      <Navbar transparent />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 w-72 h-72 bg-terracotta-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-coral-400 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
                <Zap className="w-4 h-4 text-coral-400" />
                <span className="text-sm font-medium">Trusted by 10,000+ students worldwide</span>
              </div>
              
              <h1 className="font-heading text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in animate-delay-100">
                Your Journey to
                <span className="block text-gradient bg-gradient-to-r from-coral-400 to-terracotta-400 bg-clip-text text-transparent">
                  World-Class Education
                </span>
              </h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-lg animate-fade-in animate-delay-200">
                Connect with expert counselors who'll guide you through every step of your international education journey.
              </p>

              <div className="flex flex-wrap gap-4 animate-fade-in animate-delay-300">
                <Link to={user ? "/counselors" : "/register"}>
                  <Button size="lg" className="btn-secondary text-lg px-8 py-6" data-testid="hero-cta">
                    {user ? "Find Counselors" : "Get Started Free"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/universities">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                    <Play className="w-5 h-5 mr-2" />
                    Explore Universities
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/20 animate-fade-in animate-delay-400">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center md:text-left">
                    <p className="font-heading font-bold text-3xl text-coral-400">{stat.value}</p>
                    <p className="text-white/60 text-sm">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/Cards */}
            <div className="hidden lg:block relative animate-fade-in animate-delay-300">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600" 
                  alt="Students"
                  className="rounded-3xl shadow-2xl"
                />
                
                {/* Floating Cards */}
                <div className="absolute -left-8 top-20 bg-white rounded-2xl shadow-xl p-4 animate-slide-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <Award className="w-6 h-6 text-teal-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Top Rated</p>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-xl p-4 animate-slide-in animate-delay-200">
                  <div className="flex items-center gap-3">
                    <img 
                      src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=50" 
                      alt="Counselor"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-sm">500+ Counselors</p>
                      <p className="text-xs text-muted-foreground">Ready to help</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-teal-700 font-semibold uppercase tracking-wider text-sm">Why Choose Us</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 mb-6">
              Everything You Need to <span className="text-teal-700">Succeed</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We provide comprehensive support for every aspect of your international education journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group p-8 rounded-3xl bg-sand-50 hover:bg-teal-700 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-teal-700 group-hover:bg-white rounded-2xl flex items-center justify-center mb-6 transition-colors">
                  <feature.icon className="w-7 h-7 text-white group-hover:text-teal-700" />
                </div>
                <h3 className="font-heading font-bold text-xl mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground group-hover:text-white/80 transition-colors">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-sand-50" data-testid="how-it-works">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-terracotta-700 font-semibold uppercase tracking-wider text-sm">Simple Process</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 mb-6">
              How It <span className="text-terracotta-700">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => (
              <div key={i} className="relative">
                <div className="text-8xl font-heading font-extrabold text-teal-100 absolute -top-4 left-0">
                  {item.step}
                </div>
                <div className="relative pt-16">
                  <h3 className="font-heading font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {i < howItWorks.length - 1 && (
                  <ChevronRight className="hidden lg:block absolute right-0 top-1/2 w-8 h-8 text-teal-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-teal-900 text-white" data-testid="testimonials">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <span className="text-coral-400 font-semibold uppercase tracking-wider text-sm">Success Stories</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold mt-4 mb-6">
              Students Who Made It
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/15 transition-colors">
                <div className="flex items-center gap-4 mb-6">
                  <img src={t.image} alt={t.name} className="w-14 h-14 rounded-full object-cover" />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-white/60 text-sm">{t.country}</p>
                  </div>
                </div>
                <p className="text-white/80 italic mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-2 text-coral-400">
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-semibold">{t.university}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-terracotta-600 to-terracotta-700 text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have achieved their dreams with EduAdvise.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={user ? "/counselors" : "/register"}>
              <Button size="lg" className="bg-white text-terracotta-700 hover:bg-white/90 text-lg px-8 py-6" data-testid="cta-register">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/counselors">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                Browse Counselors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
