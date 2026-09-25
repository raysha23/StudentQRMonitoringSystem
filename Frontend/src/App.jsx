// File Path: Frontend\src\App.jsx
import React, { useState } from 'react';
import Layout from './layout/Layout';
import { routes } from './routes/routes';

export default function App() {
  const [activeTab, setActiveTab] = useState('student-management');
  const ActiveComponent = routes.find((r) => r.id === activeTab)?.component;

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {ActiveComponent && <ActiveComponent />}
    </Layout>
  );
}