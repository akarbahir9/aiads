import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import CreateAd from './pages/CreateAd';
import ReferencesLibrary from './pages/ReferencesLibrary';
import BrandProfiles from './pages/BrandProfiles';
import BrandDetail from './pages/BrandDetail';
import ReferenceDetail from './pages/ReferenceDetail';

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout title="Create a new Ad"><CreateAd /></MainLayout>} />
      <Route path="/references" element={<MainLayout title="References Library"><ReferencesLibrary /></MainLayout>} />
      <Route path="/references/:folderId" element={<MainLayout title="Reference Folder"><ReferenceDetail /></MainLayout>} />
      <Route path="/brands" element={<MainLayout title="Brand Profiles"><BrandProfiles /></MainLayout>} />
      <Route path="/brands/:brandId" element={<MainLayout title="Brand Dashboard"><BrandDetail /></MainLayout>} />
    </Routes>
  );
};

export default AppRouter;
