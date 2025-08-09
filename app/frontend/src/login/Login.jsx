// src/login/Login.jsx - Updated for email/password login with shadcn colors
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from 'react';
import { LogIn, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import api from './api';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get message from registration redirect
  const message = location.state?.message;
  const messageType = location.state?.type;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Note: Backend expects 'username' field but we're sending email
      const response = await api.post('/api/token/', { 
        email: email.trim().toLowerCase(),  // Django uses username field but we're using email
        password 
      });
      const data = response.data;
      
      // Store tokens
      localStorage.setItem(ACCESS_TOKEN, data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
      
      // Store user info for role-based routing
      if (data.user_info) {
        localStorage.setItem('user_info', JSON.stringify(data.user_info));
      }

      // Redirect based on role (superuser = admin, regular = laureate)
      const userInfo = data.user_info;
      if (userInfo.is_superuser) {
        navigate('/dashboard/admin');
      } else {
        navigate('/laureate');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Fondation Académia account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Success/Error Messages */}
          {message && (
            <Alert className={`mb-4 ${
              messageType === 'success' 
                ? 'border-green-500/50 bg-green-50 dark:bg-green-950' 
                : 'border-destructive/50 bg-destructive/10'
            }`}>
              {messageType === 'success' ? 
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : 
                <AlertCircle className="h-4 w-4 text-destructive" />
              }
              <AlertDescription className={
                messageType === 'success' 
                  ? 'text-green-700 dark:text-green-300' 
                  : 'text-destructive'
              }>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert className="border-destructive/50 bg-destructive/10">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                  Register as Laureate
                </Link>
              </p>
            </div>
            
            <div className="border-t pt-4">
              <div className="bg-muted rounded-md p-3">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Admin Access:</strong> Admin accounts are created by administrators. 
                  If you're an admin, login with your admin credentials here.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginForm;