import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen, Clock, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function LoansPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Loans Management</h1>
          <Button 
            onClick={() => setLocation('/loan-request')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Loan Request
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center">
                <BookOpen className="w-6 h-6 mr-3" />
                Book Loan Management System
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Manage and track all book lending activities in your digital library
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setLocation('/loan-request')}
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-slate-50 font-semibold"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Request a Book Loan
                </Button>
                <p className="text-blue-100">
                  Click here to submit a new book borrowing request
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">-</div>
              <p className="text-xs text-slate-500">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Loans</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">-</div>
              <p className="text-xs text-slate-500">Currently borrowed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">-</div>
              <p className="text-xs text-slate-500">Successfully returned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Overdue</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">-</div>
              <p className="text-xs text-slate-500">Past due date</p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">How Book Lending Works</CardTitle>
            <CardDescription>Simple steps to borrow books from our digital library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold text-lg">1</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Submit Request</h3>
                <p className="text-sm text-slate-600">Fill out the loan request form with your employee NIK and select the book you want to borrow</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold text-lg">2</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Admin Approval</h3>
                <p className="text-sm text-slate-600">Your request will be reviewed by the library administrator for approval</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold text-lg">3</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Collect & Return</h3>
                <p className="text-sm text-slate-600">Once approved, collect your book and return it by the specified due date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
