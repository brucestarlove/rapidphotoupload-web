# Phase 1: Foundation & Core MVP

> **Goal**: Establish the project foundation and deliver a minimal viable product with core authentication, basic upload, and simple photo viewing capabilities.

---

## Overview

Phase 1 focuses on building the essential infrastructure and core user flows. This phase establishes the technical foundation (Next.js setup, design system, API integration) and delivers basic functionality that allows users to authenticate, upload photos, and view them in a simple grid layout.

**Duration Estimate**: 3-4 weeks  
**Dependencies**: Backend API must support authentication, basic upload, and photo listing endpoints

---

## Deliverables

### 1. Project Setup & Infrastructure

#### 1.1 Next.js Project Initialization
- [ ] Initialize Next.js 15+ project with App Router
- [ ] Configure TypeScript with strict mode
- [ ] Set up ESLint and Prettier
- [ ] Configure environment variables (`.env.local` template)
- [ ] Set up Git repository and initial commit structure

#### 1.2 Design System Implementation
- [ ] Install and configure Tailwind CSS 4.1
- [ ] Set up CSS variables for dark theme color palette
- [ ] Configure Tailwind theme with custom colors (purple accents, dark backgrounds)
- [ ] Install starscape-ui shadcn/ui components registry
- [ ] Create `globals.css` with design system variables
- [ ] Set up `cn()` utility function for className merging

#### 1.3 Core Dependencies Installation
- [ ] Install React Query (@tanstack/react-query)
- [ ] Install Zustand for client state
- [ ] Install Axios for HTTP client
- [ ] Install React Hook Form + Zod
- [ ] Install date-fns for date formatting
- [ ] Install required shadcn/ui components (Button, Input, Card, Dialog, Toast, etc.)

#### 1.4 Project Structure
- [ ] Create directory structure per PRD (app/, components/, lib/, hooks/, stores/, types/)
- [ ] Set up base API client (`lib/api/client.ts`) with Axios instance
- [ ] Create TypeScript type definitions (`types/api.ts`, `types/domain.ts`)
- [ ] Set up utility functions (`lib/utils/cn.ts`, `lib/utils/format.ts`)

---

### 2. Authentication System

#### 2.1 API Integration
- [ ] Create `lib/api/auth.ts` with login/register functions
- [ ] Implement JWT token storage (localStorage with XSS mitigation or httpOnly cookies)
- [ ] Set up Axios interceptors for automatic token attachment
- [ ] Implement token refresh mechanism (if backend supports)

#### 2.2 Auth State Management
- [ ] Create `stores/authStore.ts` (Zustand) for auth state
- [ ] Implement `useAuth` hook for auth operations
- [ ] Handle token expiration and logout

#### 2.3 Login Page (`app/(auth)/login/page.tsx`)
- [ ] Create login form with email/password fields
- [ ] Add "Remember me" checkbox
- [ ] Implement form validation with React Hook Form + Zod
- [ ] Add error handling and display
- [ ] Link to registration page
- [ ] Redirect to dashboard on successful login

#### 2.4 Registration Page (`app/(auth)/register/page.tsx`)
- [ ] Create registration form (email, password, confirm password)
- [ ] Add password strength indicator
- [ ] Implement form validation
- [ ] Auto-login after successful registration
- [ ] Link to login page

#### 2.5 Route Protection
- [ ] Create Next.js middleware for protected routes
- [ ] Redirect unauthenticated users to `/login`
- [ ] Protect dashboard routes (`app/(dashboard)/**`)

---

### 3. Basic Layout Components

#### 3.1 Root Layout (`app/layout.tsx`)
- [ ] Set up root HTML structure
- [ ] Include global styles (`globals.css`)
- [ ] Add React Query provider
- [ ] Configure font loading (system font stack)

#### 3.2 Dashboard Layout (`app/(dashboard)/layout.tsx`)
- [ ] Create dashboard layout wrapper
- [ ] Integrate Sidebar and Header components
- [ ] Set up main content area

#### 3.3 Sidebar Component (`components/layout/Sidebar.tsx`)
- [ ] Implement fixed left sidebar (240px width)
- [ ] Add "+ New" button (purple accent, prominent)
- [ ] Add navigation items: "My Files", "Photos", "Recent", "Trash"
- [ ] Add storage indicator at bottom (placeholder for now)
- [ ] Implement active state styling (purple highlight + left border)
- [ ] Add collapse/expand functionality (collapsed: 64px)

#### 3.4 Header Component (`components/layout/Header.tsx`)
- [ ] Create header bar (64px height)
- [ ] Add logo/branding on left
- [ ] Add search bar (center, max-width: 600px) - placeholder for Phase 3
- [ ] Add action icons: Grid view, List view, Upload, Settings, User menu (right)
- [ ] Implement user menu dropdown (logout option)

---

### 4. Basic Upload Flow

#### 4.1 Upload API Integration
- [ ] Create `lib/api/upload.ts` with upload job creation function
- [ ] Implement `POST /commands/upload-jobs` integration
- [ ] Handle presigned URL response parsing
- [ ] Create `lib/s3/multipart.ts` for multipart upload utilities (basic structure)

#### 4.2 Upload State Management
- [ ] Create `stores/uploadStore.ts` (Zustand) for upload queue
- [ ] Implement `useUpload` hook
- [ ] Track upload jobs and file progress

#### 4.3 Upload Zone Component (`components/upload/UploadZone.tsx`)
- [ ] Create drag-and-drop zone
- [ ] Implement file picker on click
- [ ] Support multiple file selection
- [ ] Client-side validation (file type, size limits)
- [ ] Visual feedback for drag-over state

#### 4.4 Basic Upload Implementation
- [ ] Implement direct-to-S3 upload (single PUT for files ≤ 5MB)
- [ ] Track upload progress per file (basic percentage)
- [ ] Handle upload completion and errors
- [ ] Show simple toast notifications for success/failure

#### 4.5 Upload Integration
- [ ] Add upload trigger from "+ New" button in Sidebar
- [ ] Add upload trigger from Header icon
- [ ] Integrate UploadZone into main dashboard page

---

### 5. Basic Photo Viewing

#### 5.1 Photos API Integration
- [ ] Create `lib/api/photos.ts` with photo listing function
- [ ] Implement `GET /queries/photos` integration
- [ ] Set up React Query hooks (`usePhotos`)

#### 5.2 Photo Grid Component (`components/photos/PhotoGrid.tsx`)
- [ ] Create responsive grid layout (4-6 columns on desktop)
- [ ] Display photo thumbnails
- [ ] Show file name (truncated with ellipsis)
- [ ] Add hover overlay with basic actions (View, Download placeholder)
- [ ] Implement empty state (centered message with upload CTA)

#### 5.3 Photo Card Component (`components/photos/PhotoCard.tsx`)
- [ ] Create individual photo card
- [ ] Display thumbnail image (lazy loading)
- [ ] Show filename and basic metadata (size, date)
- [ ] Add click handler to open viewer

#### 5.4 Basic Photo Viewer (`components/photos/PhotoViewer.tsx`)
- [ ] Create modal/overlay component
- [ ] Display full-size image (via presigned GET URL)
- [ ] Add close button (X or ESC key)
- [ ] Basic image centering and scaling

#### 5.5 Main Dashboard Page (`app/(dashboard)/page.tsx`)
- [ ] Integrate PhotoGrid component
- [ ] Fetch and display photos list
- [ ] Handle loading and error states
- [ ] Basic pagination (load more button)

---

### 6. Error Handling & User Feedback

#### 6.1 Toast Notification System
- [ ] Set up shadcn/ui Toast component
- [ ] Create toast utility functions
- [ ] Display success/error messages for uploads and API calls

#### 6.2 Error Boundaries
- [ ] Create React Error Boundary component
- [ ] Wrap dashboard routes with error boundary
- [ ] Display fallback UI on errors

#### 6.3 Loading States
- [ ] Add skeleton loaders for photo grid
- [ ] Show loading indicators during API calls
- [ ] Display loading state during uploads

---

## Technical Requirements

### API Endpoints Required
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /commands/upload-jobs`
- `GET /queries/photos` (basic pagination)
- `GET /queries/photos/{photoId}` (for viewer)

### Performance Targets
- Page load time < 3 seconds
- Basic upload progress tracking (no real-time updates yet)
- Smooth UI interactions (no freezing)

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)

---

## Acceptance Criteria

### Functional
- [ ] User can register a new account
- [ ] User can log in with email/password
- [ ] User is redirected to login if not authenticated
- [ ] User can upload a single photo (≤ 5MB) and see basic progress
- [ ] User can view uploaded photos in grid layout
- [ ] User can click a photo to view it in a modal
- [ ] User can close the photo viewer
- [ ] User can log out

### Design
- [ ] Dark theme with purple accents is applied throughout
- [ ] Sidebar and Header match design specifications
- [ ] Photo grid is responsive and visually appealing
- [ ] All interactive elements have hover/focus states

### Technical
- [ ] TypeScript strict mode passes
- [ ] ESLint passes with no errors
- [ ] Project builds successfully (`next build`)
- [ ] No console errors in browser

---

## Out of Scope (Future Phases)

- WebSocket real-time updates (Phase 2)
- High-concurrency uploads (100 files) (Phase 2)
- Upload Progress Panel with tabs (Phase 2)
- Multipart upload for large files (Phase 2)
- List view and sorting (Phase 3)
- Advanced photo viewer with metadata (Phase 3)
- Tagging system (Phase 3)
- Search functionality (Phase 3)
- Download functionality (Phase 3)
- Virtual scrolling (Phase 4)
- Performance optimizations (Phase 4)

---

## Notes

- Focus on getting core flows working end-to-end
- Prioritize code quality and type safety
- Keep components simple and focused
- Document any deviations from PRD for future phases
- Test authentication flow thoroughly before moving to upload

