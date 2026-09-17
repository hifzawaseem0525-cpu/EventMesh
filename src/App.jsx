import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import MyBookings from "./pages/MyBookings";
import MyTickets from "./pages/MyTickets";
import EventDetail from "./pages/EventDetail";
import Dashboard from "./pages/Dashboard";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Registration */}
        <Route path="/register" element={<Register />} />

        {/* Student Dashboard */}
        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        {/* My Bookings */}
        <Route
          path="/my-bookings"
          element={<MyBookings />}
        />

        {/* My Tickets */}
        <Route
          path="/my-tickets"
          element={<MyTickets />}
        />

        {/* Event Details */}
        <Route
          path="/event/:id"
          element={<EventDetail />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Create Event */}
        <Route
          path="/create-event"
          element={<CreateEvent />}
        />
        {/* Edit Event */}
       <Route
        path="/edit-event/:id"
        element={<EditEvent />}
       />
      </Routes>
    </BrowserRouter>
  );
}

export default App;