import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import { HomePage } from './pages/HomePage';
import { BrowseEventsPage } from './pages/BrowseEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { CheckInPage } from './pages/CheckInPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-brand-ivory text-brand-ink antialiased">
          {/* Top Demo System Banner */}
          <DemoBanner />

          {/* Sticky Navigation */}
          <Navbar />

          {/* Main View Router */}
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<BrowseEventsPage />} />
              <Route path="/events/:slug" element={<EventDetailsPage />} />

              {/* Protected Attendee Routes */}
              <Route
                path="/events/:slug/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings/:reference"
                element={
                  <ProtectedRoute>
                    <BookingSuccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <MyTicketsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Organizer Routes */}
              <Route
                path="/organizer/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <OrganizerDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/events/create"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer/check-in/:eventId"
                element={
                  <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                    <CheckInPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <Footer />

          {/* Global Auth Modal */}
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
