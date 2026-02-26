import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import ResumeAnalyzer from "./ResumeAnalyzer";
import SkillRoadmap from "./SkillRoadmap";
import JobPortal from "./JobPortal";
import Login from "./Login";
import Signup from "./Signup";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{ height: '100vh', color: 'white' }}>LOADING NEURAL LINK...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ResumeAnalyzer />} />
            <Route path="roadmap" element={<SkillRoadmap />} />
            <Route path="jobs" element={<JobPortal />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}