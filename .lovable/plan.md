
# Plan: Invite Team Member Dialog

## Overview
Implement an invite team member dialog that opens when clicking "Invite members" button. The dialog includes email input, role selection dropdown, optional project selection, and role-based permission logic for which roles can be invited.

## Bug Fixes Required First
The AnalyticsPage has TypeScript errors where it accesses properties not defined in types:

**File: `src/lib/api.ts`**
- Add `dms` and `avg_relevancy` to `AnalyticsPlatformPerformanceItem` interface
- Add `community_name` as optional to `AnalyticsTopCommunityItem` interface

## Implementation Steps

### 1. Create Invite Member Dialog Component
**New file: `src/components/admin/InviteMemberDialog.tsx`**

A dialog component with:
- Email input field with validation (required, valid email format)
- Role dropdown (Admin, Member, PromptEngineer)
- Optional Project dropdown (populated from user's projects list)
- Submit button with loading state
- Cancel button

Features:
- Role options filtered based on current user's role (Owner sees all, Admin sees only Member and PromptEngineer)
- Form validation using react-hook-form and zod
- API integration with the invite endpoint

### 2. Determine Current User's Role
**File: `src/pages/settings/TeamPage.tsx`**

- Find the current user's member entry from the fetched team members list
- Pass the user's role to `MemberList` component

### 3. Update MemberList Component
**File: `src/components/admin/MemberList.tsx`**

- Accept new props: `currentUserRole`, `projects`, `accessToken`
- Manage dialog open state
- Pass invite handler to dialog

### 4. API Integration
The invite endpoint will be called:
```
POST /v1.0/team_members/invite
Headers: Authorization: Bearer jwt, Content-Type: application/json
Body: { email, role, selected_project? }
```

## Technical Details

### Role Permissions Logic
```text
+----------------+--------------------------------+
| User Role      | Can Invite                     |
+----------------+--------------------------------+
| Owner          | Admin, Member, PromptEngineer  |
| Admin          | Member, PromptEngineer         |
| Member         | (no invite permission)         |
| PromptEngineer | (no invite permission)         |
+----------------+--------------------------------+
```

### Dialog Form Fields
1. **Email** (required)
   - Type: email input
   - Validation: required, valid email format using zod
   - Max length: 255 characters

2. **Role** (required)
   - Type: Select dropdown
   - Options: Admin, Member, PromptEngineer (filtered by user permissions)
   - Default: Member

3. **Project** (optional)
   - Type: Select dropdown
   - Options: All projects from user's projects list
   - Placeholder: "All projects"
   - When selected: sends `selected_project` in API payload

### Component Structure
```text
InviteMemberDialog
├── Dialog (from ui/dialog)
├── DialogContent
│   ├── DialogHeader
│   │   ├── DialogTitle: "Invite team member"
│   │   └── DialogDescription: "Send an invitation..."
│   └── Form
│       ├── FormField (Email)
│       │   └── Input type="email"
│       ├── FormField (Role)
│       │   └── Select
│       ├── FormField (Project - optional)
│       │   └── Select
│       └── DialogFooter
│           ├── Button "Cancel"
│           └── Button "Send invitation"
```

## Files Summary

**Create:**
- `src/components/admin/InviteMemberDialog.tsx`

**Modify:**
- `src/lib/api.ts` - Fix type definitions for analytics
- `src/pages/settings/TeamPage.tsx` - Determine current user role, pass projects/token
- `src/components/admin/MemberList.tsx` - Accept new props, control dialog state

## User Experience
1. User clicks "Invite members" button
2. Dialog opens with form fields
3. User enters email, selects role, optionally selects project
4. User clicks "Send invitation"
5. Loading state shown on button
6. On success: toast notification, dialog closes, member list refreshes
7. On error: toast notification with error message
