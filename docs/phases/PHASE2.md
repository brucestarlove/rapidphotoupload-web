# Phase 2: Enhanced Upload & Real-Time Features

> **Goal**: Implement high-concurrency upload support with real-time WebSocket progress updates, multipart upload handling, and a comprehensive upload progress panel.

---

## Overview

Phase 2 builds upon Phase 1's foundation to deliver the core upload experience described in the PRD. This phase focuses on handling 100+ concurrent uploads, implementing WebSocket-based real-time progress tracking, supporting multipart uploads for large files, and providing a rich upload progress UI.

**Duration Estimate**: 3-4 weeks  
**Dependencies**: Phase 1 complete, Backend WebSocket support (`/ws` endpoint), multipart upload support

---

## Deliverables

### 1. WebSocket Integration

#### 1.1 WebSocket Client Setup
- [ ] Install SockJS-client and @stomp/stompjs
- [ ] Create `lib/websocket/client.ts` with WebSocket connection management
- [ ] Implement connection lifecycle (connect, disconnect, reconnect)
- [ ] Add exponential backoff for reconnection
- [ ] Handle connection errors and retries

#### 1.2 WebSocket Hooks
- [ ] Create `hooks/useWebSocket.ts` for React integration
- [ ] Implement subscription management (`/topic/job/{jobId}`)
- [ ] Handle incoming progress update messages
- [ ] Update React Query cache optimistically from WebSocket messages
- [ ] Manage subscription cleanup on unmount

#### 1.3 Progress Update Types
- [ ] Define `ProgressUpdate` TypeScript interface
- [ ] Parse WebSocket messages and validate structure
- [ ] Handle different status types (QUEUED, UPLOADING, PROCESSING, COMPLETED, FAILED)

---

### 2. High-Concurrency Upload System

#### 2.1 Upload Queue Management
- [ ] Enhance `stores/uploadStore.ts` to handle 100+ concurrent uploads
- [ ] Implement upload queue with priority management
- [ ] Track individual file progress and status
- [ ] Manage upload concurrency limits (configurable, default: 100)
- [ ] Handle queue pause/resume functionality

#### 2.2 Enhanced Upload Hook (`hooks/useUpload.ts`)
- [ ] Refactor to support batch uploads
- [ ] Implement upload job creation for multiple files
- [ ] Coordinate multiple file uploads simultaneously
- [ ] Track progress per file and aggregate progress
- [ ] Handle partial failures (some files succeed, others fail)

#### 2.3 Upload API Enhancements
- [ ] Enhance `lib/api/upload.ts` to handle batch file metadata
- [ ] Parse multipart upload responses (uploadId, partSize)
- [ ] Implement `POST /commands/upload/progress` for best-effort progress updates
- [ ] Add retry logic for failed uploads

---

### 3. Multipart Upload Implementation

#### 3.1 Multipart Upload Utilities (`lib/s3/multipart.ts`)
- [ ] Implement file chunking logic (split files into parts)
- [ ] Calculate optimal part size (default: 5MB threshold)
- [ ] Upload individual parts to S3 presigned URLs
- [ ] Track progress per part
- [ ] Implement part upload retry logic
- [ ] Handle multipart upload completion

#### 3.2 Upload Strategy Selection
- [ ] Detect file size and choose upload strategy
- [ ] Files ≤ 5MB: Single PUT request
- [ ] Files > 5MB: Multipart upload
- [ ] Handle edge cases (very large files, network interruptions)

#### 3.3 Progress Tracking
- [ ] Calculate accurate progress for multipart uploads
- [ ] Aggregate part progress into overall file progress
- [ ] Send progress updates to backend (`POST /commands/upload/progress`)
- [ ] Throttle progress updates to ~16ms intervals (60fps target)

---

### 4. Upload Progress Panel

#### 4.1 Progress Panel Component (`components/layout/UploadProgressPanel.tsx`)
- [ ] Create floating window (bottom-right, 400px width)
- [ ] Implement draggable functionality
- [ ] Add minimize/maximize toggle (collapsible to icon-only)
- [ ] Set max-height: 600px with scrollable content
- [ ] Style according to design system (dark theme, purple accents)

#### 4.2 Progress Panel Tabs
- [ ] Implement tab system: "All", "Active", "Completed", "Failed"
- [ ] Filter uploads by status per tab
- [ ] Show count badges on tabs (e.g., "Active (5)")
- [ ] Persist selected tab in UI store

#### 4.3 Per-File Progress Display
- [ ] Create `components/progress/ProgressBar.tsx` component
- [ ] Display progress bar with percentage for each file
- [ ] Show file name (truncated), file size, and status
- [ ] Add status badge using `components/progress/JobStatusBadge.tsx`
- [ ] Color-code progress bars by status (green for completed, red for failed)

#### 4.4 Batch Summary
- [ ] Display aggregate statistics: "53 uploading (8%)"
- [ ] Show total files, completed count, failed count
- [ ] Calculate overall progress percentage
- [ ] Update summary in real-time as uploads progress

#### 4.5 Upload Actions
- [ ] Add cancel button for active uploads
- [ ] Add retry button for failed uploads
- [ ] Add clear button for completed uploads
- [ ] Implement "Clear All" functionality

---

### 5. Upload Queue Component

#### 5.1 Upload Queue Display (`components/upload/UploadQueue.tsx`)
- [ ] List all files in current upload job
- [ ] Show file order and queue position
- [ ] Display upload status per file
- [ ] Allow reordering (drag-and-drop, if time permits)

#### 5.2 Queue Management
- [ ] Pause/resume all uploads
- [ ] Cancel specific uploads
- [ ] Remove completed uploads from queue
- [ ] Show queue statistics (pending, active, completed)

---

### 6. Real-Time Status Updates

#### 6.1 WebSocket Integration with Upload Store
- [ ] Connect WebSocket messages to upload store
- [ ] Update file status in real-time (QUEUED → UPLOADING → PROCESSING → COMPLETED)
- [ ] Update progress percentages from WebSocket
- [ ] Handle status transitions smoothly

#### 6.2 UI Updates
- [ ] Update progress bars smoothly (throttled to 60fps)
- [ ] Animate status badge changes
- [ ] Refresh photo list when uploads complete
- [ ] Show toast notifications for batch completion

#### 6.3 Error Handling
- [ ] Display error messages from WebSocket updates
- [ ] Show failed uploads with error details
- [ ] Allow retry for failed uploads
- [ ] Handle WebSocket disconnection gracefully (fallback to polling)

---

### 7. Performance Optimization

#### 7.1 Upload Performance
- [ ] Ensure UI remains responsive during 100 concurrent uploads
- [ ] Use Web Workers for file chunking (if needed)
- [ ] Implement request throttling to prevent browser overload
- [ ] Optimize memory usage (release file references after upload)

#### 7.2 Progress Rendering
- [ ] Throttle progress bar updates to ~16ms intervals
- [ ] Use React.memo for progress components
- [ ] Batch state updates to prevent excessive re-renders
- [ ] Optimize progress calculation algorithms

#### 7.3 Network Optimization
- [ ] Implement upload retry with exponential backoff
- [ ] Handle network interruptions gracefully
- [ ] Resume interrupted uploads where possible
- [ ] Optimize presigned URL usage (cache, reuse)

---

### 8. Upload Job Status API

#### 8.1 Job Status Integration
- [ ] Create `GET /queries/upload-jobs/{jobId}` integration
- [ ] Poll job status as fallback if WebSocket unavailable
- [ ] Display job-level status (QUEUED, IN_PROGRESS, COMPLETED, FAILED)
- [ ] Show job statistics (totalCount, completedCount, failedCount)

#### 8.2 Status Synchronization
- [ ] Sync upload store with backend job status
- [ ] Handle discrepancies between client and server state
- [ ] Recover from missed WebSocket updates

---

## Technical Requirements

### API Endpoints Required
- `POST /commands/upload-jobs` (enhanced for batch)
- `POST /commands/upload/progress` (best-effort progress updates)
- `GET /queries/upload-jobs/{jobId}` (job status)
- WebSocket endpoint: `/ws` with STOMP protocol
- WebSocket topic: `/topic/job/{jobId}`

### Performance Targets
- Support 100 concurrent uploads without UI freezing
- Progress bars update at 60fps (throttled to ~16ms intervals)
- WebSocket reconnection within 5 seconds
- Upload progress accuracy within 1%

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Acceptance Criteria

### Functional
- [ ] User can upload 100 files concurrently
- [ ] Upload progress updates in real-time via WebSocket
- [ ] Progress bars display accurate percentages
- [ ] Multipart upload works for files > 5MB
- [ ] Upload Progress Panel displays all active uploads
- [ ] User can filter uploads by status (All, Active, Completed, Failed)
- [ ] User can cancel active uploads
- [ ] User can retry failed uploads
- [ ] Batch summary shows accurate statistics
- [ ] UI remains responsive during high-concurrency uploads

### Performance
- [ ] 100 files (2MB avg) upload without UI freezing
- [ ] Progress bars update smoothly (60fps)
- [ ] WebSocket reconnects automatically on disconnect
- [ ] Memory usage remains stable during uploads

### Design
- [ ] Upload Progress Panel matches design specifications
- [ ] Progress bars are visually clear and informative
- [ ] Status badges use appropriate colors
- [ ] Panel is draggable and collapsible

### Technical
- [ ] WebSocket connection is stable and handles reconnection
- [ ] Multipart upload handles large files correctly
- [ ] Error handling covers network failures and edge cases
- [ ] No memory leaks during long upload sessions

---

## Out of Scope (Future Phases)

- List view and sorting (Phase 3)
- Advanced photo viewer with metadata panel (Phase 3)
- EXIF data display (Phase 3)
- Tagging system (Phase 3)
- Search functionality (Phase 3)
- Download functionality (Phase 3)
- Virtual scrolling (Phase 4)
- Advanced performance optimizations (Phase 4)

---

## Notes

- WebSocket implementation should be robust with proper error handling
- Test with various file sizes and network conditions
- Ensure multipart upload works correctly with S3
- Monitor memory usage during high-concurrency uploads
- Consider adding upload speed indicators (MB/s) if time permits

