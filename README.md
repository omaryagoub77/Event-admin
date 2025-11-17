# Event Venue Admin Dashboard

A complete admin dashboard for managing an event venue business website, built with React, Firebase, and Tailwind CSS.

## Features

- **Authentication**: Secure login with Firebase Authentication
- **Dashboard**: Overview of key metrics and quick actions
- **Content Management**: Full CRUD operations for all website content
- **Real-time Updates**: Live data synchronization with Firebase Firestore
- **Responsive Design**: Works on all device sizes
- **Dark Mode**: Toggle between light and dark themes

## Pages

1. **Dashboard** - Overview of facilities, gallery items, packages, and bookings
2. **Hero Section** - Manage hero headline, subtext, and background image
3. **Facilities** - Create, edit, delete, and reorder venue facilities
4. **Gallery** - Upload and manage gallery images with categories
5. **Packages** - Manage event packages with features and pricing
6. **Bookings** - View, approve, reject, and delete booking requests
7. **Policies** - Create and manage venue policies
8. **Testimonials** - Add and manage customer testimonials
9. **Contact Info** - Update venue contact information
10. **FAQ** - Manage frequently asked questions

## Tech Stack

- **Frontend**: React with Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Routing**: React Router
- **UI Components**: Custom component library
- **Forms**: React Hook Form with Zod validation

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Visit `http://localhost:5173` in your browser

## Firebase Configuration

The dashboard is configured to work with Firebase. All Firebase configuration is included directly in the code.

## Deployment

Build for production: `npm run build`
Preview build: `npm run preview`