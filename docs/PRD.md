# Frontend PRD — RapidPhotoUpload Web Client (Next.js)

> **Scope**: Design and implement a modern, high-performance web frontend for the RapidPhotoUpload media uploader & viewer. The application will be separately deployed from the Spring Boot backend (deployed on EC2) and will communicate via REST APIs and WebSocket connections. The UI design should be inspired by Proton Drive, featuring a dark theme with purple accents, clean file management interface, and real-time upload progress tracking.

---

## 1) Goals & Non-Goals

### Goals

* **Modern, Responsive UI**: Build a beautiful, dark-themed file management interface similar to Proton Drive, optimized for desktop and tablet viewing.
* **High-Concurrency Upload Support**: Handle up to 100 concurrent file uploads with individual and batch progress tracking, maintaining UI responsiveness throughout.
* **Real-Time Progress**: Display live upload progress via WebSocket connections, showing per-file status (Queued → Uploading → Processing → Completed/Failed).
* **Media Gallery**: Provide an intuitive photo viewer with metadata display, filtering, tagging, and download capabilities.
* **Performance**: Ensure smooth interactions, fast navigation, and efficient rendering of large photo collections.
* **Type Safety**: Leverage TypeScript throughout for type-safe API integration and component development.

### Non-Goals

* Mobile-first responsive design (optimized for desktop/tablet; mobile support is secondary).
* Advanced image editing capabilities (viewing and metadata only).
* Offline support or PWA features (Phase 2 consideration).
* Multi-user collaboration or sharing features (Phase 2 consideration).

---

## 2) Technical Stack & Architecture

### Core Technologies

* **Framework**: Next.js 15+ (App Router) with React Server Components where applicable
* **UI Components**: shadcn/ui
* **Styling**: Tailwind CSS 4.1 with CSS variables for theming
* **State Management**: React Query (TanStack Query) for server state, Zustand for client state
* **Real-Time**: WebSocket client (SockJS + STOMP.js) for progress updates
* **HTTP Client**: Axios or native `fetch` with interceptors for JWT authentication
* **Form Handling**: React Hook Form with Zod validation
* **File Upload**: Direct-to-S3 multipart uploads using presigned URLs
* **Routing**: Next.js App Router with file-based routing
* **Build Tool**: Turbopack (Next.js default)

### Project Structure

```
rapidupload-web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected route group
│   │   ├── layout.tsx            # Dashboard layout with sidebar
│   │   ├── page.tsx              # Main file listing page
│   │   ├── photos/
│   │   │   └── [photoId]/
│   │   └── upload/
│   ├── api/                      # API routes (if needed for proxying)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles + Tailwind
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components (from starscape-ui)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── UploadProgressPanel.tsx
│   ├── photos/
│   │   ├── PhotoGrid.tsx
│   │   ├── PhotoCard.tsx
│   │   ├── PhotoViewer.tsx
│   │   └── PhotoMetadata.tsx
│   ├── upload/
│   │   ├── UploadZone.tsx
│   │   └── UploadQueue.tsx
│   └── progress/
│       ├── ProgressBar.tsx
│       └── JobStatusBadge.tsx
├── lib/                          # Utilities & configurations
│   ├── api/                      # API client functions
│   │   ├── auth.ts
│   │   ├── upload.ts
│   │   ├── photos.ts
│   │   └── client.ts             # Axios instance with interceptors
│   ├── websocket/                # WebSocket client
│   │   ├── client.ts
│   │   └── hooks.ts              # React hooks for WebSocket
│   ├── s3/                       # S3 upload utilities
│   │   └── multipart.ts
│   └── utils/
│       ├── cn.ts                 # className utility
│       └── format.ts             # Date, size formatting
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useUpload.ts
│   ├── usePhotos.ts
│   └── useWebSocket.ts
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   └── uploadStore.ts
├── types/                        # TypeScript types
│   ├── api.ts                    # API response types
│   └── domain.ts                 # Domain models
├── public/                       # Static assets
└── tailwind.config.ts            # Tailwind configuration
```

---

## 3) Design System & UI Specifications

### Color Palette (Dark Theme)

* **Backgrounds**:
  * Primary: `#0a0a0a` (near-black)
  * Secondary: `#141414` (dark gray)
  * Tertiary: `#1f1f1f` (lighter dark gray)
  * Hover: `#2a2a2a`
* **Accent (Purple)**:
  * Primary: `#8b5cf6` (violet-500)
  * Hover: `#7c3aed` (violet-600)
  * Active: `#6d28d9` (violet-700)
  * Light: `#a78bfa` (violet-400)
* **Text**:
  * Primary: `#ffffff` (white)
  * Secondary: `#a1a1aa` (zinc-400)
  * Tertiary: `#71717a` (zinc-500)
* **Borders**: `#27272a` (zinc-800)
* **Status Colors**:
  * Success: `#10b981` (emerald-500)
  * Error: `#ef4444` (red-500)
  * Warning: `#f59e0b` (amber-500)
  * Info: `#3b82f6` (blue-500)

### Typography

* **Font Family**: System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`)
* **Headings**: 
  * H1: `text-3xl font-semibold` (30px)
  * H2: `text-2xl font-semibold` (24px)
  * H3: `text-xl font-medium` (20px)
* **Body**: `text-base` (16px), `text-sm` (14px) for secondary text
* **Monospace**: For file names, IDs, timestamps

### Component Specifications

#### Sidebar
* **Width**: 240px (collapsed: 64px)
* **Position**: Fixed left, full height
* **Sections**:
  * "+ New" button (purple, prominent at top)
  * Navigation items: "My Files", "Photos", "Recent", "Trash"
  * Storage indicator at bottom (e.g., "136.63 GB / 530.00 GB")
* **Active State**: Purple background highlight + left border accent

#### Header
* **Height**: 64px
* **Components**:
  * Logo/branding (left)
  * Search bar (center, max-width: 600px)
  * Action icons: Grid view, List view, Upload, Settings, User menu (right)
* **Search**: Full-text search with debounce (300ms), highlights matches

#### File Listing Area
* **View Modes**: Grid (default) and List
* **Grid View**:
  * Responsive columns (4-6 columns on desktop)
  * Photo thumbnails with overlay on hover (actions: View, Download, Delete)
  * File name truncated with ellipsis
  * Status badge (Completed, Processing, Failed)
* **List View**:
  * Columns: Name (with icon), Modified date, Size
  * Sortable columns (Name ↑, Modified, Size)
  * Row hover highlight
* **Empty State**: Centered message with upload CTA

#### Upload Progress Panel
* **Position**: Floating window (bottom-right, draggable)
* **Size**: 400px width, max-height: 600px
* **Tabs**: All, Active, Completed, Failed
* **Content**:
  * Per-file progress bars with percentage
  * File name (truncated), size, status
  * Batch summary: "53 uploading (8%)"
* **Minimize/Maximize**: Collapsible to icon-only state

#### Photo Viewer (Modal/Overlay)
* **Full-screen overlay** with dark backdrop
* **Image Display**: Centered, max-width: 90vw, max-height: 90vh
* **Navigation**: Previous/Next arrows, keyboard shortcuts
* **Metadata Panel**: Slide-out from right
  * Filename, dimensions, file size
  * EXIF data (if available): Camera, ISO, aperture, date taken
  * Tags (editable)
  * Download button (presigned URL)

---

## 4) Core Features & User Flows

### 4.1 Authentication Flow

1. **Login Page** (`/login`)
   * Email/password form
   * "Remember me" checkbox
   * Link to registration
   * Error handling for invalid credentials
   * JWT token stored in httpOnly cookie (via API route) or localStorage (with XSS mitigation)

2. **Registration Page** (`/register`)
   * Email, password, confirm password
   * Password strength indicator
   * Auto-login after successful registration

3. **Protected Routes**
   * Middleware checks authentication
   * Redirects to `/login` if unauthenticated
   * Token refresh mechanism (before expiration)

### 4.2 Upload Flow

1. **Initiate Upload**
   * User drags & drops files or clicks "+ New" → "Upload Files"
   * File picker opens (supports multiple selection)
   * Files validated client-side (type, size limits)
   * Upload queue created

2. **Create Upload Job**
   * Frontend calls `POST /commands/upload-jobs` with file metadata
   * Backend returns `jobId` and presigned URLs per file
   * Upload Progress Panel appears

3. **Direct-to-S3 Upload**
   * For each file:
     * If file > 5MB: Use multipart upload (split into parts, upload each part)
     * If file ≤ 5MB: Single PUT request
   * Track upload progress per part/file
   * Send progress updates to `POST /commands/upload/progress` (best-effort)

4. **Real-Time Status Updates**
   * WebSocket connection to `/ws`
   * Subscribe to `/topic/job/{jobId}`
   * Receive status updates: `{photoId, status, progressPercent}`
   * Update UI accordingly (progress bars, status badges)

5. **Completion**
   * All files reach terminal state (Completed/Failed)
   * Upload Progress Panel shows summary
   * File listing refreshes to show new photos
   * Success notification displayed

### 4.3 Photo Viewing Flow

1. **Browse Photos**
   * Main page (`/`) shows all photos in grid/list view
   * Pagination: Load more (infinite scroll) or page-based
   * Filter by status, tags, date range
   * Search by filename

2. **View Photo Details**
   * Click photo thumbnail → opens Photo Viewer modal
   * Display full-size image (via presigned GET URL)
   * Show metadata panel (EXIF, tags, etc.)
   * Navigate with arrow keys or on-screen buttons

3. **Download Photo**
   * Click download button → calls `GET /queries/photos/{photoId}/download-url`
   * Receive presigned URL (time-boxed, e.g., 15 minutes)
   * Trigger browser download

### 4.4 Tagging Flow

1. **Add Tags**
   * From Photo Viewer metadata panel
   * Input field with autocomplete (existing tags)
   * Call `POST /commands/photos/{photoId}/tags`
   * Update UI optimistically

2. **Filter by Tags**
   * Sidebar or filter dropdown
   * Call `GET /queries/photos?tag={tagName}`
   * Update listing

---

## 5) API Integration Specifications

### Authentication APIs

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  userId: string;
  email: string;
}

// POST /api/auth/register
interface RegisterRequest {
  email: string;
  password: string;
}
```

### Upload APIs

```typescript
// POST /commands/upload-jobs
interface CreateUploadJobRequest {
  files: Array<{
    filename: string;
    mimeType: string;
    bytes: number;
  }>;
  strategy: "s3-presigned";
}

interface CreateUploadJobResponse {
  jobId: string;
  items: Array<{
    photoId: string;
    method: "PUT";
    presignedUrl: string;
    multipart?: {
      uploadId: string;
      partSize: number;
    };
  }>;
}

// POST /commands/upload/progress
interface UpdateProgressRequest {
  photoId: string;
  bytesSent: number;
  bytesTotal: number;
}
```

### Query APIs

```typescript
// GET /queries/photos
interface PhotoListResponse {
  photos: Array<PhotoSummary>;
  total: number;
  page: number;
  size: number;
}

interface PhotoSummary {
  photoId: string;
  filename: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
  status: "QUEUED" | "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  completedAt?: string;
  tags: string[];
}

// GET /queries/photos/{photoId}
interface PhotoMetadataResponse {
  photoId: string;
  filename: string;
  mimeType: string;
  bytes: number;
  width?: number;
  height?: number;
  s3Key: string;
  exifJson?: Record<string, any>;
  status: string;
  createdAt: string;
  completedAt?: string;
  tags: string[];
}

// GET /queries/photos/{photoId}/download-url
interface DownloadUrlResponse {
  url: string;
  expiresAt: string;
}

// GET /queries/upload-jobs/{jobId}
interface JobStatusResponse {
  jobId: string;
  status: "QUEUED" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "CANCELLED";
  totalCount: number;
  completedCount: number;
  failedCount: number;
  items: Array<{
    photoId: string;
    status: string;
    progressPercent: number;
  }>;
}
```

### WebSocket Messages

```typescript
// Client subscribes to: /topic/job/{jobId}
interface ProgressUpdate {
  jobId: string;
  photoId: string;
  status: string;
  progressPercent: number;
  message?: string;
  timestamp: string;
}
```

---

## 6) State Management Strategy

### Server State (React Query)

* **Photos List**: `useQuery` with pagination, filtering, search
* **Photo Metadata**: `useQuery` per photo ID
* **Upload Jobs**: `useQuery` for job status
* **Mutations**: `useMutation` for upload job creation, tagging, deletion

### Client State (Zustand)

* **Auth Store**: Current user, token, login/logout actions
* **Upload Store**: Active upload jobs, progress tracking, queue management
* **UI Store**: View mode (grid/list), sidebar collapsed state, selected photos

### WebSocket State

* **Real-Time Updates**: WebSocket messages update React Query cache optimistically
* **Connection Management**: Auto-reconnect on disconnect, exponential backoff

---

## 7) Performance Requirements

### Upload Performance

* **Concurrent Uploads**: Support 100 simultaneous uploads without UI freezing
* **Progress Updates**: Render progress bars at 60fps (throttle updates to ~16ms intervals)
* **Memory Management**: Release file references after upload completion

### Rendering Performance

* **Virtual Scrolling**: Use `react-window` or `@tanstack/react-virtual` for large photo lists (1000+ items)
* **Image Lazy Loading**: Load thumbnails on-demand as user scrolls
* **Thumbnail Optimization**: Request appropriate thumbnail size based on view mode (256px for grid, 1024px for viewer)

### Network Optimization

* **Request Batching**: Batch multiple API calls where possible
* **Debouncing**: Debounce search input (300ms)
* **Caching**: Aggressive React Query caching (staleTime: 5 minutes)
* **Prefetching**: Prefetch photo metadata on hover

---

## 8) Error Handling & User Feedback

### Error Types

1. **Network Errors**: Retry with exponential backoff, show toast notification
2. **Authentication Errors**: Redirect to login, clear stored tokens
3. **Upload Failures**: Show error in Upload Progress Panel, allow retry
4. **Validation Errors**: Inline form validation, highlight invalid fields

### User Feedback Mechanisms

* **Toast Notifications**: Success, error, warning messages (using shadcn/ui toast)
* **Loading States**: Skeleton loaders, progress indicators
* **Empty States**: Helpful messages with CTAs
* **Error Boundaries**: Catch React errors, show fallback UI

---

## 9) Security Considerations

### Authentication

* **JWT Storage**: Prefer httpOnly cookies (via Next.js API routes) or secure localStorage with XSS mitigation
* **Token Refresh**: Implement refresh token flow if backend supports it
* **CSRF Protection**: Use SameSite cookies, CSRF tokens if needed

### File Upload Security

* **Client-Side Validation**: Validate file types, sizes before upload
* **Presigned URLs**: Use time-limited presigned URLs (15 minutes default)
* **CORS**: Ensure backend CORS allows frontend origin

### Data Privacy

* **No Sensitive Data in URLs**: Avoid exposing photo IDs or tokens in URLs when possible
* **Secure Headers**: Ensure backend sets appropriate security headers

---

## 10) Accessibility (a11y)

### WCAG 2.1 AA Compliance

* **Keyboard Navigation**: Full keyboard support for all interactive elements
* **Screen Reader Support**: Proper ARIA labels, roles, descriptions
* **Color Contrast**: Ensure text meets contrast ratios (4.5:1 for normal text)
* **Focus Indicators**: Visible focus outlines for keyboard navigation
* **Alt Text**: Provide alt text for images (use filename as fallback)

### Implementation

* Use semantic HTML elements
* Leverage shadcn/ui components (built with accessibility in mind)
* Test with screen readers (NVDA, VoiceOver)

---

## 11) Deployment & DevOps

### Build & Deployment

* **Build Command**: `next build`
* **Output**: Standalone static export or Node.js server (depending on requirements)
* **Deployment Target**: Vercel, AWS Amplify, or self-hosted (separate from backend EC2)
* **Environment Variables**:
  * `NEXT_PUBLIC_API_URL`: Backend API base URL (e.g., `https://api.example.com`)
  * `NEXT_PUBLIC_WS_URL`: WebSocket URL (e.g., `wss://api.example.com/ws`)

### CI/CD Pipeline

* **Linting**: ESLint + TypeScript strict mode
* **Type Checking**: `tsc --noEmit`
* **Testing**: Unit tests (Jest/Vitest), integration tests (Playwright)
* **Build Verification**: Ensure build succeeds before deployment

### Monitoring & Analytics

* **Error Tracking**: Sentry or similar for error monitoring
* **Performance Monitoring**: Web Vitals tracking
* **Analytics**: Optional user analytics (privacy-compliant)

---

## 12) Component Library Integration

### starscape-ui shadcn/ui Registry

* **Installation**: Follow starscape-ui registry setup instructions
* **Components to Use**:
  * Button, Input, Card, Dialog, Toast, Progress, Badge, Avatar
  * Table, Dropdown Menu, Tabs, Select, Checkbox, Radio Group
  * Skeleton, Alert, Separator, ScrollArea
* **Theming**: Override CSS variables in `globals.css` to match design system
* **Customization**: Extend components as needed while maintaining design consistency

### Tailwind CSS 4.1 Configuration

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b5cf6',
          hover: '#7c3aed',
          active: '#6d28d9',
        },
        background: {
          DEFAULT: '#0a0a0a',
          secondary: '#141414',
          tertiary: '#1f1f1f',
        },
      },
    },
  },
}
```

---

## 13) Testing Strategy

### Unit Tests

* **Components**: Test component rendering, user interactions (React Testing Library)
* **Hooks**: Test custom hooks (useUpload, useWebSocket)
* **Utils**: Test formatting, validation functions

### Integration Tests

* **API Integration**: Mock API responses, test data flow
* **WebSocket**: Mock WebSocket messages, test real-time updates
* **Upload Flow**: Test file selection, upload initiation, progress tracking

### E2E Tests (Playwright)

* **Critical Paths**:
  * Login → Upload files → View photos → Download
  * Search → Filter → View details
* **Cross-Browser**: Chrome, Firefox, Safari

---

## 14) Acceptance Criteria

### Functional Requirements

1. ✅ User can log in and register successfully
2. ✅ User can upload 100 files concurrently with visible progress
3. ✅ Upload progress updates in real-time via WebSocket
4. ✅ User can view photos in grid and list views
5. ✅ User can filter photos by status, tags, and search by filename
6. ✅ User can view photo details with metadata and EXIF data
7. ✅ User can download photos via presigned URLs
8. ✅ User can add tags to photos
9. ✅ UI remains responsive during high-concurrency uploads
10. ✅ All API errors are handled gracefully with user feedback

### Performance Requirements

1. ✅ Upload 100 files (2MB avg) without UI freezing
2. ✅ Photo list renders smoothly with 1000+ items (virtual scrolling)
3. ✅ Progress bars update smoothly (60fps)
4. ✅ Page load time < 2 seconds on 3G connection

### Design Requirements

1. ✅ Dark theme with purple accents matches design system
2. ✅ Responsive layout works on desktop (1920x1080) and tablet (1024x768)
3. ✅ All interactive elements have hover/focus states
4. ✅ Consistent spacing and typography throughout

---

## 15) Future Enhancements (Phase 2)

* **Mobile App**: React Native app sharing the same backend APIs
* **Advanced Search**: Full-text search with EXIF filtering
* **Bulk Operations**: Select multiple photos, bulk delete/tag
* **Sharing**: Generate shareable links for photos
* **Albums/Collections**: Organize photos into albums
* **Image Editing**: Basic crop, rotate, filter operations
* **Offline Support**: Service Worker for offline viewing
* **PWA**: Installable web app with offline capabilities

---

## 16) Dependencies & Package Management

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "sockjs-client": "^1.6.1",
    "@stomp/stompjs": "^7.0.0",
    "date-fns": "^3.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^4.1.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@playwright/test": "^1.41.0"
  }
}
```

### starscape-ui Components

* Install components from starscape-ui registry as needed
* Follow registry documentation for installation and theming

---

## 17) API Base URL Configuration

### Development

* **API URL**: `http://localhost:8080` (or backend dev server)
* **WebSocket URL**: `ws://localhost:8080/ws`

### Production

* **API URL**: Backend EC2 instance URL `http://18.222.212.37:8080/`
* **WebSocket URL**: `ws://18.222.212.37:8080/ws`
* **CORS**: Backend must allow frontend origin

---

## 18) Design Mockups Reference

The UI should closely match the Proton Drive interface shown in the reference image:

* **Left Sidebar**: Navigation with "+ New" button, storage indicator
* **Top Header**: Search bar, action icons, user menu
* **Main Content**: File listing with grid/list toggle, sortable columns
* **Upload Panel**: Floating window with tabs (All, Active, Completed, Failed)
* **Dark Theme**: Near-black backgrounds with purple accent colors
* **Typography**: Clean, sans-serif fonts with appropriate hierarchy

---

## Notes

* This PRD assumes the backend is fully functional and deployed to EC2
* Frontend will be deployed separately (Vercel, Amplify, or self-hosted)
* All API contracts match the backend PRD specifications
* WebSocket implementation follows Spring WebSocket/STOMP conventions
* The design system prioritizes dark theme with purple accents for brand consistency
