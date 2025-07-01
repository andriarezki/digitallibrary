import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Book, Users, BarChart3, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({ user: "", pass: "" });
  const { login, isLoginPending } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(credentials);
      setLocation("/");
      toast({
        title: "Login successful",
        description: "Welcome to the Digital Library System",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - 3D Animation & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-60 right-32 w-24 h-24 bg-white/5 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-40 left-40 w-40 h-40 bg-white/5 rounded-full animate-pulse delay-500"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-white/10 rounded-full animate-bounce delay-2000"></div>
        </div>
        
        {/* 3D Floating Books Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="floating-book-1">
              <div className="w-20 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-2xl transform rotate-12 hover:rotate-6 transition-transform duration-1000"></div>
            </div>
            <div className="floating-book-2">
              <div className="w-16 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg shadow-2xl transform -rotate-12 hover:rotate-0 transition-transform duration-1000 absolute -top-8 -left-12"></div>
            </div>
            <div className="floating-book-3">
              <div className="w-18 h-26 bg-gradient-to-br from-pink-400 to-red-500 rounded-lg shadow-2xl transform rotate-6 hover:-rotate-3 transition-transform duration-1000 absolute top-4 left-16"></div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <BookOpen className="w-16 h-16 mb-6 text-white" />
            <h1 className="text-4xl font-bold mb-4">Digital Library System</h1>
            <p className="text-xl text-blue-100 mb-8">
              Manage your entire library collection with powerful tools and analytics
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Book className="w-8 h-8 text-blue-200" />
              <div>
                <h3 className="font-semibold">16,794+ Books</h3>
                <p className="text-blue-200 text-sm">Complete digital catalog management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <BarChart3 className="w-8 h-8 text-blue-200" />
              <div>
                <h3 className="font-semibold">Analytics Dashboard</h3>
                <p className="text-blue-200 text-sm">Real-time insights and reporting</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-blue-200" />
              <div>
                <h3 className="font-semibold">Secure Access</h3>
                <p className="text-blue-200 text-sm">Role-based authentication system</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8 lg:hidden">
            <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
            <h2 className="text-3xl font-bold text-slate-900">Digital Library</h2>
          </div>
          
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h2>
                <p className="text-slate-600">Sign in to your admin account</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={credentials.user}
                    onChange={(e) =>
                      setCredentials({ ...credentials, user: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Enter your username"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={credentials.pass}
                    onChange={(e) =>
                      setCredentials({ ...credentials, pass: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="Enter your password"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoginPending}
                  className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all transform hover:scale-105"
                >
                  {isLoginPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  Default: user / user
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <div className="mt-8 text-center text-sm text-slate-500">
            © 2025 Digital Library System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
