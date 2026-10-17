
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const MyTickets = lazy(() => import("./pages/MyTickets"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const ManageTickets = lazy(() => import("./pages/Managetickets"));
const OrganizerScanner = lazy(() => import("./pages/OrganizerScanner"));

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Suspense
        fallback={
          <div role="status" style={{ padding: "24px", textAlign: "center" }}>
            Loading page...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-tickets" element={<MyTickets />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/organizer/scanner" element={<OrganizerScanner />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/edit-event/:id" element={<EditEvent />} />
          <Route path="/manage-tickets/:eventId" element={<ManageTickets />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
