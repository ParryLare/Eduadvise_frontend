import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { GraduationCap, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const from = location.state?.from?.pathname || "/student/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const data = await login(formData.email, formData.password);
      toast.success("Welcome back!");
      
      // Redirect based on user type
      if (data.user.user_type === 'admin') {
        navigate('/admin', { replace: true });
      } else if (data.user.user_type === 'counselor') {
        navigate('/counselor/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex" data-testid="login-page">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-teal-700 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-heading font-bold text-xl">EduAdvise</span>
          </Link>

          <h1 className="font-heading text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to continue your journey</p>

          {/* Google Login */}
          <Button 
            variant="outline" 
            className="w-full mb-6 h-12 gap-2"
            onClick={googleLogin}
            type="button"
            data-testid="google-login-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-sand-50 px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-12"
                  data-testid="email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 h-12"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 btn-primary" disabled={loading} data-testid="login-submit">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-teal-700 font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {/* Demo Accounts */}
          <div className="mt-8 p-4 bg-muted rounded-xl">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Admin: admin@eduadvise.com / admin123</p>
              <p>Counselor: sarah.johnson@eduadvise.com / password123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-teal-700 to-teal-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-terracotta-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-coral-400 rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-12">
          <h2 className="font-heading text-4xl font-bold mb-4 text-center">Start Your Global Education Journey</h2>
          <p className="text-xl text-white/80 text-center max-w-md">
            Connect with expert counselors and explore universities worldwide.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
