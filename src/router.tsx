import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import CreateAd from './pages/CreateAd';
import ReferencesLibrary from './pages/ReferencesLibrary';
import BrandProfiles from './pages/BrandProfiles';
import BrandDetail from './pages/BrandDetail';
import ReferenceDetail from './pages/ReferenceDetail';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route path="/app" element={<ProtectedRoute><MainLayout title="Create a new Ad"><CreateAd /></MainLayout></ProtectedRoute>} />
      <Route path="/app/references" element={<ProtectedRoute><MainLayout title="References Library"><ReferencesLibrary /></MainLayout></ProtectedRoute>} />
      <Route path="/app/references/:folderId" element={<ProtectedRoute><MainLayout title="Reference Folder"><ReferenceDetail /></MainLayout></ProtectedRoute>} />
      <Route path="/app/brands" element={<ProtectedRoute><MainLayout title="Brand Profiles"><BrandProfiles /></MainLayout></ProtectedRoute>} />
      <Route path="/app/brands/:brandId" element={<ProtectedRoute><MainLayout title="Brand Dashboard"><BrandDetail /></MainLayout></ProtectedRoute>} />
    </Routes>
  );
};

export default AppRouter;
