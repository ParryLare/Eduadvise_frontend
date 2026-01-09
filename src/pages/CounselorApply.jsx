import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API, useAuth } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { 
  GraduationCap, CheckCircle, ArrowLeft, Upload, Plus, X
} from "lucide-react";

const CounselorApply = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    credentials: "",
    experience_years: "",
    specializations: [],
    languages: [],
    bio: "",
    photo: "",
    linkedin_url: ""
  });

  const allSpecializations = ["USA", "UK", "Canada", "Australia", "Germany", "Europe", "Singapore", "Netherlands"];
  const allLanguages = ["English", "Spanish", "Mandarin", "Hindi", "German", "French", "Korean", "Portuguese", "Arabic", "Japanese"];

  const toggleSelection = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.credentials || !formData.experience_years || 
        formData.specializations.length === 0 || formData.languages.length === 0 || !formData.bio) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API}/counselors/apply`, {
        ...formData,
        experience_years: parseInt(formData.experience_years)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Application submitted! You'll be notified once reviewed.");
      navigate('/counselor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50" data-testid="counselor-apply">
      <Navbar />

      <div className="pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          {/* Header */}
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <h1 className="font-heading text-4xl font-bold mb-2">Become a Counselor</h1>
            <p className="text-muted-foreground">
              Join our platform and help students achieve their study abroad dreams.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div 
                key={s}
                className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-teal-700 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${step > s ? 'bg-teal-700' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Steps */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold">Professional Information</h2>
                
                <div>
                  <Label htmlFor="credentials">Credentials & Qualifications *</Label>
                  <Input
                    id="credentials"
                    placeholder="e.g., PhD in Education, Certified Educational Consultant"
                    value={formData.credentials}
                    onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="photo">Profile Photo URL</Label>
                  <Input
                    id="photo"
                    placeholder="https://example.com/your-photo.jpg"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter a URL to your professional photo</p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setStep(2)} className="btn-primary">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold">Expertise & Languages</h2>
                
                <div>
                  <Label className="mb-3 block">Country Specializations * (Select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {allSpecializations.map((spec) => (
                      <Badge
                        key={spec}
                        variant={formData.specializations.includes(spec) ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-2 ${
                          formData.specializations.includes(spec) 
                            ? 'bg-teal-700 hover:bg-teal-600' 
                            : 'hover:bg-teal-50'
                        }`}
                        onClick={() => toggleSelection('specializations', spec)}
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Languages Spoken * (Select all that apply)</Label>
                  <div className="flex flex-wrap gap-2">
                    {allLanguages.map((lang) => (
                      <Badge
                        key={lang}
                        variant={formData.languages.includes(lang) ? "default" : "outline"}
                        className={`cursor-pointer px-4 py-2 ${
                          formData.languages.includes(lang) 
                            ? 'bg-terracotta-700 hover:bg-terracotta-600' 
                            : 'hover:bg-terracotta-50'
                        }`}
                        onClick={() => toggleSelection('languages', lang)}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="btn-primary">
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-heading text-2xl font-bold">Your Bio</h2>
                
                <div>
                  <Label htmlFor="bio">Professional Bio * (Max 500 words)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell students about your background, experience, and how you can help them achieve their study abroad goals..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1"
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.bio.split(/\s+/).filter(Boolean).length}/500 words
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-sand-50 rounded-xl p-6">
                  <h3 className="font-semibold mb-4">Application Summary</h3>
                  <div className="space-y-3 text-sm">
                    <p><strong>Credentials:</strong> {formData.credentials || 'Not provided'}</p>
                    <p><strong>Experience:</strong> {formData.experience_years} years</p>
                    <p><strong>Specializations:</strong> {formData.specializations.join(', ') || 'None selected'}</p>
                    <p><strong>Languages:</strong> {formData.languages.join(', ') || 'None selected'}</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    className="btn-primary"
                    disabled={loading}
                    data-testid="submit-application"
                  >
                    {loading ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CounselorApply;
