
# Plan: Add Notification Icon and Page

## Overview
Add a notification bell icon to the top-right of the main content area header, styled consistently with the existing sidebar toggle button. Clicking the icon navigates to a new dedicated notifications page.

## Changes Required

### 1. Fix Existing Build Errors
Before implementing the notification feature, two existing bugs need to be fixed:

**File: `src/components/admin/MainSidebar.tsx`**
- Line 298: Change `class` to `className` (React JSX syntax)

**File: `src/context/SidebarContext.tsx`**
- Update `setDesktopSidebarOpen` type to accept a function updater pattern (like React's setState)

**File: `src/layouts/MainLayout.tsx`**  
- Adjust toggle handler to work with the corrected context type

### 2. Add Notification Icon to Header
**File: `src/layouts/MainLayout.tsx`**

- Import `Bell` icon from lucide-react
- Import `useNavigate` (already imported)
- Add Bell icon button to the desktop header (right side), matching the existing PanelLeft button style:
  - Size: `h-9 w-9`
  - Border radius: `rounded-lg`
  - Border and background: `border border-border bg-card/80 hover:bg-card`
  - Position: far right of header using `ml-auto`
- Add same icon button to mobile header for consistency
- OnClick: navigate to `/notifications`

### 3. Create Notifications Page
**New file: `src/pages/NotificationsPage.tsx`**

Create a page component following the existing page patterns:
- Empty state with Bell icon and placeholder message
- Title: "Notifications"
- Consistent styling with other pages
- Future-ready structure for displaying notification items

### 4. Register Route
**File: `src/App.tsx`**

- Import `NotificationsPage`
- Add route `/notifications` within the MainLayout routes

### 5. Add Page Metadata
**File: `src/layouts/MainLayout.tsx`**

Add notifications case in `getPageMeta()`:
- Title: "Notifications"
- Subtitle: "Stay updated with your latest activity"

## Visual Design
The notification icon button will match the reference image style:
- Rounded corners with subtle border
- Ghost variant with card background
- Muted icon color that changes on hover
- Positioned symmetrically opposite to the sidebar toggle

## Technical Details

```text
+--------------------------------------------------+
|  [=]                                      [Bell] |  <- Desktop Header
|                                                  |
|              Main Content Area                   |
|                                                  |
+--------------------------------------------------+
```

The notification icon will appear:
- **Desktop**: In the header row, pushed to the far right with `ml-auto`
- **Mobile**: In the mobile header, after the page title, aligned to the right

Files to create:
- `src/pages/NotificationsPage.tsx`

Files to modify:
- `src/layouts/MainLayout.tsx`
- `src/App.tsx`
- `src/context/SidebarContext.tsx`
- `src/components/admin/MainSidebar.tsx`
