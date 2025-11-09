# Phase 3: Advanced Viewing & Organization

> **Goal**: Implement advanced photo viewing capabilities, metadata display, tagging system, search functionality, and improved organization features.

---

## Overview

Phase 3 enhances the photo viewing and organization experience. This phase focuses on implementing list view with sorting, an advanced photo viewer with metadata panel, EXIF data display, tagging capabilities, search functionality, and download features.

**Duration Estimate**: 3-4 weeks  
**Dependencies**: Phase 2 complete, Backend support for tags, search, and download URLs

---

## Deliverables

### 1. List View & Sorting

#### 1.1 List View Component
- [ ] Create `components/photos/PhotoList.tsx` component
- [ ] Display photos in table/list format
- [ ] Columns: Name (with icon), Modified date, Size, Status
- [ ] Implement row hover highlight
- [ ] Add click handler to open viewer

#### 1.2 Sortable Columns
- [ ] Implement sorting by Name (ascending/descending)
- [ ] Implement sorting by Modified date (newest/oldest)
- [ ] Implement sorting by Size (largest/smallest)
- [ ] Add sort indicators (↑ ↓) in column headers
- [ ] Persist sort preference in UI store

#### 1.3 View Mode Toggle
- [ ] Enhance Header component with Grid/List view toggle
- [ ] Update UI store to track current view mode
- [ ] Switch between Grid and List views seamlessly
- [ ] Persist view mode preference (localStorage)

#### 1.4 View Mode Integration
- [ ] Update main dashboard page to support both views
- [ ] Ensure consistent behavior across view modes
- [ ] Maintain scroll position when switching views

---

### 2. Advanced Photo Viewer

#### 2.1 Enhanced Photo Viewer (`components/photos/PhotoViewer.tsx`)
- [ ] Full-screen overlay with dark backdrop
- [ ] Centered image display (max-width: 90vw, max-height: 90vh)
- [ ] Image scaling and zoom functionality
- [ ] Smooth transitions between photos
- [ ] Loading state for image loading

#### 2.2 Navigation Controls
- [ ] Previous/Next arrow buttons
- [ ] Keyboard shortcuts (Arrow keys, Escape to close)
- [ ] Click outside to close
- [ ] Navigate through photo list in viewer
- [ ] Disable navigation at first/last photo

#### 2.3 Metadata Panel (`components/photos/PhotoMetadata.tsx`)
- [ ] Slide-out panel from right side
- [ ] Toggle button to show/hide metadata panel
- [ ] Smooth slide animation
- [ ] Responsive layout (collapses on mobile/tablet)

#### 2.4 Metadata Display
- [ ] Filename (editable, if backend supports)
- [ ] Image dimensions (width × height)
- [ ] File size (formatted: MB, GB)
- [ ] Created date and modified date
- [ ] Status badge
- [ ] S3 key (for debugging, optional)

---

### 3. EXIF Data Display

#### 3.1 EXIF Data Parsing
- [ ] Parse `exifJson` from photo metadata API
- [ ] Display camera information (make, model)
- [ ] Display shooting settings (ISO, aperture, shutter speed)
- [ ] Display date taken (if available)
- [ ] Display GPS location (if available, with map link)
- [ ] Format EXIF values appropriately

#### 3.2 EXIF UI Component
- [ ] Create EXIF section in metadata panel
- [ ] Group related EXIF fields logically
- [ ] Show "N/A" for missing EXIF data
- [ ] Add tooltips for technical terms
- [ ] Style according to design system

#### 3.3 EXIF Integration
- [ ] Fetch EXIF data when opening photo viewer
- [ ] Cache EXIF data in React Query
- [ ] Handle photos without EXIF data gracefully

---

### 4. Tagging System

#### 4.1 Tag API Integration
- [ ] Create `POST /commands/photos/{photoId}/tags` integration
- [ ] Create `GET /queries/photos?tag={tagName}` integration
- [ ] Implement tag creation and deletion
- [ ] Handle tag validation (character limits, formatting)

#### 4.2 Tag Display Component
- [ ] Display tags in metadata panel
- [ ] Show tags as removable chips/badges
- [ ] Add visual indicator for editable state
- [ ] Style tags with purple accent color

#### 4.3 Tag Input Component
- [ ] Create tag input field with autocomplete
- [ ] Fetch existing tags for autocomplete suggestions
- [ ] Support adding multiple tags at once
- [ ] Validate tag format (no special characters, length limits)
- [ ] Show tag suggestions as user types

#### 4.4 Tag Management
- [ ] Add tags to photos
- [ ] Remove tags from photos
- [ ] Update UI optimistically (before API confirmation)
- [ ] Handle tag API errors gracefully
- [ ] Show loading state during tag operations

#### 4.5 Tag Filtering
- [ ] Add tag filter dropdown in sidebar or header
- [ ] Fetch all available tags
- [ ] Filter photos by selected tag
- [ ] Show active tag filter indicator
- [ ] Clear tag filter option

---

### 5. Search Functionality

#### 5.1 Search API Integration
- [ ] Enhance `GET /queries/photos` to support search query parameter
- [ ] Implement debounced search (300ms delay)
- [ ] Handle search errors and empty results
- [ ] Cache search results in React Query

#### 5.2 Search Bar Component
- [ ] Enhance Header search bar (from Phase 1 placeholder)
- [ ] Implement search input with debounce
- [ ] Add search icon and clear button
- [ ] Show loading indicator during search
- [ ] Display search result count

#### 5.3 Search Results
- [ ] Highlight matching text in search results
- [ ] Show "No results found" message
- [ ] Display search query in results header
- [ ] Clear search functionality

#### 5.4 Search Integration
- [ ] Update photo list/grid when search query changes
- [ ] Maintain search query in URL (optional, for sharing)
- [ ] Combine search with filters (status, tags)

---

### 6. Download Functionality

#### 6.1 Download API Integration
- [ ] Create `GET /queries/photos/{photoId}/download-url` integration
- [ ] Handle presigned URL response
- [ ] Parse expiration time
- [ ] Cache download URLs (respect expiration)

#### 6.2 Download Implementation
- [ ] Add download button in photo viewer metadata panel
- [ ] Add download action in photo card hover overlay
- [ ] Trigger browser download from presigned URL
- [ ] Show download progress indicator (if possible)
- [ ] Handle download errors

#### 6.3 Download UX
- [ ] Show toast notification on download start
- [ ] Handle download failures with error message
- [ ] Support downloading multiple photos (if time permits)
- [ ] Respect file naming (use original filename)

---

### 7. Filtering & Organization

#### 7.1 Status Filtering
- [ ] Add status filter dropdown
- [ ] Filter by: All, Completed, Processing, Failed, Queued
- [ ] Update photo list based on selected status
- [ ] Show active filter indicator
- [ ] Combine with search and tag filters

#### 7.2 Date Range Filtering
- [ ] Add date range picker component
- [ ] Filter photos by creation date range
- [ ] Support "Last 7 days", "Last 30 days", "This year" presets
- [ ] Custom date range selection
- [ ] Clear date filter option

#### 7.3 Filter Combination
- [ ] Support multiple active filters simultaneously
- [ ] Update URL with filter parameters (optional)
- [ ] Reset all filters functionality
- [ ] Show active filter summary

---

### 8. Photo Navigation Improvements

#### 8.1 Photo List Navigation
- [ ] Navigate through photos in viewer using arrow keys
- [ ] Show photo index (e.g., "Photo 5 of 23")
- [ ] Jump to specific photo in list
- [ ] Maintain filter/search context when navigating

#### 8.2 Keyboard Shortcuts
- [ ] Arrow Left/Right: Navigate photos
- [ ] Escape: Close viewer
- [ ] F: Fullscreen (if time permits)
- [ ] D: Download current photo
- [ ] T: Focus tag input
- [ ] Show keyboard shortcuts help modal (optional)

---

### 9. Pagination & Infinite Scroll

#### 9.1 Enhanced Pagination
- [ ] Implement "Load More" button for infinite scroll
- [ ] Or implement page-based pagination with page numbers
- [ ] Handle pagination with filters/search active
- [ ] Show loading state during pagination
- [ ] Maintain scroll position when loading more

#### 9.2 Performance Considerations
- [ ] Optimize photo list rendering with pagination
- [ ] Prefetch next page on scroll (if infinite scroll)
- [ ] Handle large result sets efficiently

---

## Technical Requirements

### API Endpoints Required
- `GET /queries/photos` (with search, filter, tag parameters)
- `GET /queries/photos/{photoId}` (with EXIF data)
- `GET /queries/photos/{photoId}/download-url`
- `POST /commands/photos/{photoId}/tags`
- `GET /queries/tags` (for autocomplete, if available)

### Performance Targets
- Search results appear within 500ms
- Photo viewer opens smoothly (< 200ms)
- Metadata panel animations are smooth (60fps)
- Tag operations complete within 1 second

### Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Acceptance Criteria

### Functional
- [ ] User can switch between Grid and List views
- [ ] User can sort photos by Name, Date, Size
- [ ] User can view photo details in advanced viewer
- [ ] User can see EXIF data in metadata panel
- [ ] User can add tags to photos
- [ ] User can remove tags from photos
- [ ] User can filter photos by tags
- [ ] User can search photos by filename
- [ ] User can download photos via presigned URLs
- [ ] User can filter photos by status and date range
- [ ] User can navigate between photos in viewer
- [ ] Keyboard shortcuts work as specified

### Design
- [ ] List view matches design specifications
- [ ] Photo viewer is visually appealing and functional
- [ ] Metadata panel slides smoothly
- [ ] Tags are styled consistently
- [ ] Search bar is intuitive and responsive

### Technical
- [ ] All API integrations work correctly
- [ ] Search is debounced appropriately
- [ ] Tag operations are optimistic and handle errors
- [ ] Download URLs are handled securely
- [ ] Filters combine correctly
- [ ] No performance degradation with large photo lists

---

## Out of Scope (Future Phases)

- Virtual scrolling for very large lists (Phase 4)
- Advanced performance optimizations (Phase 4)
- Bulk operations (select multiple, bulk delete/tag) (Future)
- Albums/Collections (Future)
- Image editing (crop, rotate) (Future)
- Sharing functionality (Future)

---

## Notes

- Prioritize user experience in photo viewer (smooth navigation, fast loading)
- Ensure tag autocomplete is responsive and helpful
- Test search with various query lengths and special characters
- Consider adding photo metadata editing if backend supports it
- Ensure download functionality works across different browsers

