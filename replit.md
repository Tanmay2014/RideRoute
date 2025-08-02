# Overview

RideConnect is a social platform for motorcycle and bike enthusiasts to create, discover, and participate in group tours. The application enables riders to organize tours with specific routes and stops, share photos from their adventures, and connect with fellow riders in their community. Users can browse available tours, join rides that interest them, and build a social network around their shared passion for riding.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing a modern component-based architecture. The UI leverages shadcn/ui components built on Radix UI primitives for consistent, accessible interface elements. Styling is handled through Tailwind CSS with custom design tokens for colors and spacing. The application uses Wouter for lightweight client-side routing and TanStack Query for server state management and data fetching. The frontend follows a mobile-first responsive design approach with a bottom navigation pattern for mobile devices.

## Backend Architecture
The server is built with Express.js and TypeScript, following a REST API design pattern. The application implements a modular structure with separate concerns for routing, database operations, and authentication. The storage layer uses a repository pattern to abstract database operations, making the codebase maintainable and testable. The server handles file uploads, session management, and provides RESTful endpoints for tours, photos, and user management.

## Database Design
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations. The schema includes tables for users, tours, tour stops, tour participants, photos, photo likes, tour reviews, and sessions. The database design supports complex relationships between entities, enabling features like tour participation tracking, photo sharing with likes, and review systems. The schema uses UUID primary keys and includes proper indexing for session management.

## Authentication System
Authentication is handled through Replit's OpenID Connect (OIDC) integration using Passport.js. The system implements session-based authentication with PostgreSQL session storage using connect-pg-simple. User authentication state is managed through secure HTTP-only cookies, and the system includes proper middleware for protecting authenticated routes. The authentication flow includes automatic user creation and profile management.

## State Management
Client-side state management is handled through TanStack Query for server state and React's built-in state management for local component state. The application implements optimistic updates and proper error handling for network requests. Query invalidation strategies ensure data consistency across different views, and the system includes retry logic for failed requests.

## Real-time Features Architecture
The application is designed to support real-time features for active tours, including group chat, location sharing, and emergency SOS functionality. The frontend includes components for active tour management with tabbed interfaces for different tour aspects like navigation, group communication, and emergency features.

# External Dependencies

## Database Services
- **Neon PostgreSQL**: Cloud-hosted PostgreSQL database service used as the primary data store
- **Database Connection**: Uses connection pooling through @neondatabase/serverless for efficient database access

## Authentication Provider
- **Replit Authentication**: OpenID Connect integration for user authentication and session management
- **Session Storage**: PostgreSQL-backed session storage for maintaining user authentication state

## UI Component Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives for building the interface
- **shadcn/ui**: Pre-built component library built on top of Radix UI with consistent styling
- **Lucide React**: Icon library providing consistent iconography throughout the application

## Development Tools
- **Vite**: Build tool and development server for fast development experience
- **TypeScript**: Type safety and enhanced developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **ESBuild**: Fast JavaScript bundler for production builds

## Data Fetching
- **TanStack Query**: Server state management with caching, background updates, and optimistic updates
- **Fetch API**: Native web API for making HTTP requests to the backend

## Form Handling
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation library for type-safe form validation and API data validation

## Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx & tailwind-merge**: Utility for conditionally joining CSS classes
- **nanoid**: Secure URL-friendly unique string ID generator