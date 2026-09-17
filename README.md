# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# EventMesh

EventMesh is a responsive event management and booking web application developed as a frontend internship project.

The application provides separate experiences for students and event organizers. Students can explore published events, search and filter events, view event details, book tickets, manage their bookings, and view their tickets. Organizers can create, edit, manage, and update the status of events through an organizer dashboard.

---

## Project Overview

The goal of EventMesh is to provide a simple and user-friendly platform for discovering and managing events.

The frontend was developed with a focus on:

- Clean and modern UI design
- Responsive layouts
- Reusable React components
- Interactive event management
- Student booking workflows
- Organizer event management
- Accessibility and keyboard navigation
- Modular and maintainable code structure

---

## Key Features

### Student Features

- Student dashboard
- Browse published events
- Search events by title, category, or location
- Filter events by category
- View detailed event information
- Select ticket quantities
- Book events
- View booking history
- View confirmed tickets
- Navigate directly from a booking to its ticket

### Organizer Features

- Organizer dashboard
- View event statistics
- Create new events
- Edit existing events
- Update event status
- Manage Draft and Published events
- View booking information
- Delete events

### UI and Accessibility

- Responsive design for mobile, tablet, and desktop
- Reusable UI components
- Keyboard navigation
- Visible focus states
- Descriptive image alternative text
- Clear form controls and labels
- Empty states for pages without data
- Consistent spacing, typography, and visual hierarchy

---

## Technologies Used

- React
- Vite
- JavaScript
- React Router
- Tailwind CSS
- HTML5
- CSS
- JavaScript Local Storage

---

## Libraries and Design Approach

### React

React was used to build the application using reusable and modular components.

### React Router

React Router is used for navigation between different pages and views.

### Tailwind CSS

Tailwind CSS is used to create responsive layouts and maintain consistent styling throughout the application.

### Local Storage

Browser Local Storage is used to simulate persistent frontend data such as:

- Created events
- Edited events
- Event status
- Bookings

This allows the application to demonstrate interactive functionality without requiring a backend service.

---

## Application Views

EventMesh contains multiple interconnected views.

### 1. Student Dashboard

Students can browse upcoming published events, search events, and filter them by category.

### 2. Event Detail

Students can view complete information about an event and proceed with booking tickets.

### 3. My Bookings

Students can view their confirmed bookings and navigate directly to the corresponding ticket.

### 4. My Tickets

Students can view their confirmed tickets and booking details.

### 5. Organizer Dashboard

Organizers can manage events, view statistics, edit events, and change event status.

### 6. Create Event

Organizers can create new events by entering event details.

### 7. Edit Event

Organizers can update existing event information.

---

## Development Process

The project was developed in multiple stages, starting with project setup and planning and progressing through component development, page implementation, interaction, testing, and final polishing.

### Phase 1 — Project Setup and Planning

The React + Vite project was initialized and the basic application structure was created.

The main pages, reusable components, navigation requirements, and user flows were planned before implementing the complete interface.

The application was divided into student-facing and organizer-facing views to keep the user experience organized.

### Phase 2 — Component Development

Reusable components were created for common interface elements such as:

- Navigation bar
- Buttons
- Event cards
- Ticket tier selection
- Statistics cards

Creating reusable components helped maintain consistency across different pages and reduced repeated UI code.

### Phase 3 — View Development

The major application views were implemented:

- Landing Page
- Login
- Registration
- Student Dashboard
- Event Detail
- My Bookings
- My Tickets
- Organizer Dashboard
- Create Event
- Edit Event

React Router was used to connect the different views and provide navigation between pages.

### Phase 4 — Interaction and Integration

Frontend interactions were implemented using React state management and browser Local Storage.

The following interactions were implemented:

- Creating events
- Editing events
- Deleting events
- Changing event status
- Searching events
- Filtering events by category
- Booking tickets
- Viewing bookings
- Viewing tickets
- Navigating from a booking directly to its ticket

Created and edited event information is stored in Local Storage so that frontend changes can persist between page navigation and browser refreshes.

Event status was also integrated into the student experience so that published events can be displayed to students while other event statuses can be managed by organizers.

### Phase 5 — Testing and Polish

After implementing the main functionality, the application was tested through simulated user interactions.

Functional testing included:

- Creating an event
- Editing an event
- Deleting an event
- Changing event status
- Searching for events
- Filtering events
- Booking an event
- Viewing bookings
- Viewing tickets
- Navigating from My Bookings to My Tickets

The interface was also tested at different viewport sizes to check responsiveness across mobile, tablet, and desktop devices.

Keyboard navigation was tested using the `Tab` and `Enter` keys to check basic accessibility.

The final stage focused on fixing interaction issues, improving consistency, and preparing the project for submission.

---

## Design Patterns and Best Practices

The project follows several frontend development practices:

- Component-based architecture
- Reusable React components
- Separation of pages, components, and data
- React state management using hooks
- Client-side routing
- Local Storage for frontend persistence
- Responsive layouts
- Semantic HTML elements
- Accessible navigation and controls
- Clear and consistent UI hierarchy
- Modular file organization

---

## Project Structure

```text
EventMesh/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Button.jsx
│   │   ├── EventCard.jsx
│   │   ├── TicketTierSelector.jsx
│   │   └── StatCard.jsx
│   │
│   ├── data/
│   │   └── events.js
│   │
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── EventDetail.jsx
│   │   ├── MyBookings.jsx
│   │   ├── MyTickets.jsx
│   │   ├── Dashboard.jsx
│   │   ├── CreateEvent.jsx
│   │   └── EditEvent.jsx
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── package.json
├── vite.config.js
└── README.md