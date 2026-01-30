# Replymer API Specification (Extended)

**Version:** 1.0
**Base URL:** `https://internal-api.autoreply.ing/v1.0`
**Authentication:** Bearer token (JWT)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Projects](#projects)
4. [Team Members](#team-members)
5. [Communities](#communities)
6. [Keywords](#keywords)
7. [Leads](#leads)
8. [Prompts](#prompts)
9. [Analytics](#analytics)
10. [Subscriptions](#subscriptions)
11. [Usage](#usage)
12. [Notifications](#notifications)
13. [Platform Connections](#platform-connections)

---

## Authentication

### Sign In via Magic Link

Request a magic link to be sent to the user's email.

**Endpoint:** `POST /signin`

**Request:**
```json
{
  "email": "microsaas.farm@gmail.com"
}
```

**Response:**
```json
{
  "token": "9f57c370-1cc0-4ac2-8586-65afcc691c52",
  "expires_at": "2026-01-30T16:24:20.552592Z"
}
```

---

### Confirm Magic Link Sign In

Confirm the magic link token and receive access token.

**Endpoint:** `POST /signin/confirm`

**Request:**
```json
{
  "email": "microsaas.farm@gmail.com",
  "token": "91a88b7e-f121-4a27-9de3-c917a533ce7e"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "ec064a37-b11a-4a7a-b965-2b752d3706a1",
    "email": "microsaas.farm@gmail.com",
    "name": "microsaas.farm",
    "team_member_status": "accepted"
  }
}
```

---

### Sign In via Google OAuth

**Endpoint:** `POST /signin/google`

**Request:**
```json
{
  "credential": "google_oauth_credential_token"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "ec064a37-b11a-4a7a-b965-2b752d3706a1",
    "email": "user@gmail.com",
    "name": "John Doe",
    "avatar_url": "https://lh3.googleusercontent.com/...",
    "team_member_status": "accepted"
  }
}
```

---

### Sign Out

**Endpoint:** `POST /signout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Successfully signed out"
}
```

---

## Users

### Get Current User

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "ec064a37-b11a-4a7a-b965-2b752d3706a1",
  "email": "microsaas.farm@gmail.com",
  "first_name": "Oleg",
  "last_name": "Kuprovskiy",
  "avatar_url": "https://...",
  "theme_preference": "dark",
  "default_project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "created_at": "2026-01-15T10:00:00Z"
}
```

---

### Update Current User

**Endpoint:** `PATCH /users/me`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "first_name": "Oleg",
  "last_name": "Kuprovskiy",
  "theme_preference": "dark"
}
```

**Response:**
```json
{
  "id": "ec064a37-b11a-4a7a-b965-2b752d3706a1",
  "email": "microsaas.farm@gmail.com",
  "first_name": "Oleg",
  "last_name": "Kuprovskiy",
  "avatar_url": "https://...",
  "theme_preference": "dark",
  "default_project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd"
}
```

---

### Delete Current User Account

**Endpoint:** `DELETE /users/me`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

---

## Projects

Projects represent brands or products being monitored. Each project has its own settings, communities, keywords, and leads.

### List All Projects

Get all projects the current user has access to.

**Endpoint:** `GET /projects`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `include_inactive` (boolean, optional): Include inactive projects. Default: false

**Response:**
```json
{
  "items": [
    {
      "id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "name": "My Product",
      "website_url": "https://myproduct.com",
      "description": "AI-powered analytics platform",
      "is_default": true,
      "is_active": true,
      "unread_count": 12,
      "created_at": "2026-01-10T10:00:00Z",
      "updated_at": "2026-01-29T15:30:00Z"
    },
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-1e2f3a4b5c6d",
      "name": "Side Project",
      "website_url": "https://sideproject.io",
      "description": "Developer tools for startups",
      "is_default": false,
      "is_active": true,
      "unread_count": 5,
      "created_at": "2026-01-15T14:20:00Z",
      "updated_at": "2026-01-28T09:15:00Z"
    },
    {
      "id": "b2c3d4e5-f6a7-5b6c-9d0e-2f3a4b5c6d7e",
      "name": "Client A",
      "website_url": "https://clienta.com",
      "description": "Marketing automation SaaS",
      "is_default": false,
      "is_active": true,
      "unread_count": 8,
      "created_at": "2026-01-20T11:45:00Z",
      "updated_at": "2026-01-30T08:00:00Z"
    }
  ],
  "total": 3
}
```

---

### Get Project by ID

**Endpoint:** `GET /projects/{project_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "name": "My Product",
  "website_url": "https://myproduct.com",
  "description": "AI-powered analytics platform for modern teams",
  "target_audience": "B2B SaaS companies with 10-100 employees",
  "value_proposition": "Get actionable insights 10x faster than traditional analytics",
  "is_default": true,
  "is_active": true,
  "created_at": "2026-01-10T10:00:00Z",
  "updated_at": "2026-01-29T15:30:00Z"
}
```

---

### Create Project

**Endpoint:** `POST /projects`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "New Product",
  "website_url": "https://newproduct.com",
  "description": "Revolutionary new SaaS",
  "target_audience": "Small business owners",
  "value_proposition": "Save 10 hours per week on admin tasks",
  "is_default": false
}
```

**Response:**
```json
{
  "id": "c3d4e5f6-a7b8-6c7d-0e1f-3a4b5c6d7e8f",
  "name": "New Product",
  "website_url": "https://newproduct.com",
  "description": "Revolutionary new SaaS",
  "target_audience": "Small business owners",
  "value_proposition": "Save 10 hours per week on admin tasks",
  "is_default": false,
  "is_active": true,
  "created_at": "2026-01-30T12:00:00Z",
  "updated_at": "2026-01-30T12:00:00Z"
}
```

---

### Update Project

**Endpoint:** `PATCH /projects/{project_id}`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "website_url": "https://updated.com",
  "target_audience": "Enterprise companies",
  "value_proposition": "Enterprise-grade security and compliance"
}
```

**Response:**
```json
{
  "id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "name": "Updated Product Name",
  "website_url": "https://updated.com",
  "description": "Updated description",
  "target_audience": "Enterprise companies",
  "value_proposition": "Enterprise-grade security and compliance",
  "is_default": true,
  "is_active": true,
  "updated_at": "2026-01-30T12:30:00Z"
}
```

---

### Delete Project

Soft deletes a project.

**Endpoint:** `DELETE /projects/{project_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Project deleted successfully",
  "id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd"
}
```

---

### Set Default Project

**Endpoint:** `POST /projects/{project_id}/set-default`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Default project updated",
  "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd"
}
```

---

## Team Members

### List Team Members

Get all team members for the current project.

**Endpoint:** `GET /team_members`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `cursor` (string, optional): Pagination cursor
- `limit` (integer, optional): Number of items per page. Default: 20

**Response:**
```json
{
  "items": [
    {
      "id": "f59eee8a-da44-4b93-9c53-67810f5b6203",
      "role": "owner",
      "user_id": "ec064a37-b11a-4a7a-b965-2b752d3706a1",
      "status": "accepted",
      "name": "Oleg Kuprovskiy",
      "first_name": "Oleg",
      "last_name": "Kuprovskiy",
      "email": "microsaas.farm@gmail.com",
      "avatar_url": "https://...",
      "joined_at": "2026-01-30T16:03:37.701159Z"
    },
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "role": "admin",
      "user_id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
      "status": "accepted",
      "name": "Jane Smith",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "avatar_url": "https://...",
      "joined_at": "2026-01-25T10:15:00Z"
    }
  ],
  "next_cursor": null
}
```

---

### Get Team Member by ID

**Endpoint:** `GET /team_members/{team_member_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "f59eee8a-da44-4b93-9c53-67810f5b6203",
  "role": "owner",
  "user_id": "ec064a37-b11a-4a7a-b965-2b752d3706a1",
  "status": "accepted",
  "name": "Oleg Kuprovskiy",
  "first_name": "Oleg",
  "last_name": "Kuprovskiy",
  "email": "microsaas.farm@gmail.com",
  "avatar_url": "https://...",
  "joined_at": "2026-01-30T16:03:37.701159Z"
}
```

---

### Invite Team Member

**Endpoint:** `POST /team_members/invite`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
Content-Type: application/json
```

**Request:**
```json
{
  "email": "microsaas.farm+1@gmail.com",
  "role": "admin"
}
```

**Response:**
```json
{
  "message": "Invitation sent successfully",
  "email": "microsaas.farm+1@gmail.com",
  "user_exists": true,
  "status": "invited"
}
```

---

### Update Team Member Role

**Endpoint:** `PATCH /team_members/{team_member_id}`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "role": "admin"
}
```

**Response:**
```json
{
  "id": "f59eee8a-da44-4b93-9c53-67810f5b6203",
  "role": "admin",
  "updated_at": "2026-01-30T12:00:00Z"
}
```

---

### Delete Team Member

Remove a team member from the project.

**Endpoint:** `DELETE /team_members/{team_member_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Team member removed successfully",
  "id": "35a5ba80-1a5a-4508-b722-db38eee1498a"
}
```

---

## Communities

Communities are social media channels to monitor (subreddits, hashtags, LinkedIn groups).

### List Communities

Get all communities for a project.

**Endpoint:** `GET /communities`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `platform` (string, optional): Filter by platform (reddit, twitter, linkedin)
- `active_only` (boolean, optional): Only return active communities. Default: true

**Response:**
```json
{
  "items": [
    {
      "id": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
      "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "platform": "reddit",
      "name": "r/SaaS",
      "display_name": "SaaS - Software as a Service",
      "is_active": true,
      "lead_count": 47,
      "last_checked_at": "2026-01-30T11:45:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": "d2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a",
      "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "platform": "twitter",
      "name": "#B2BSaaS",
      "display_name": "B2B SaaS",
      "is_active": true,
      "lead_count": 23,
      "last_checked_at": "2026-01-30T12:00:00Z",
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": "e3f4a5b6-c7d8-9e0f-1a2b-3c4d5e6f7a8b",
      "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "platform": "linkedin",
      "name": "SaaS Growth",
      "display_name": "SaaS Growth Strategies",
      "is_active": false,
      "lead_count": 8,
      "last_checked_at": "2026-01-28T09:30:00Z",
      "created_at": "2026-01-20T14:00:00Z"
    }
  ],
  "total": 3
}
```

---

### Add Community

**Endpoint:** `POST /communities`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
Content-Type: application/json
```

**Request:**
```json
{
  "platform": "reddit",
  "name": "r/startups",
  "display_name": "Startups"
}
```

**Response:**
```json
{
  "id": "f4a5b6c7-d8e9-0f1a-2b3c-4d5e6f7a8b9c",
  "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "platform": "reddit",
  "name": "r/startups",
  "display_name": "Startups",
  "is_active": true,
  "lead_count": 0,
  "created_at": "2026-01-30T12:30:00Z"
}
```

---

### Update Community

**Endpoint:** `PATCH /communities/{community_id}`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "is_active": false
}
```

**Response:**
```json
{
  "id": "f4a5b6c7-d8e9-0f1a-2b3c-4d5e6f7a8b9c",
  "is_active": false,
  "updated_at": "2026-01-30T13:00:00Z"
}
```

---

### Delete Community

**Endpoint:** `DELETE /communities/{community_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Community removed successfully",
  "id": "f4a5b6c7-d8e9-0f1a-2b3c-4d5e6f7a8b9c"
}
```

---

### Get Community Suggestions

Get AI-suggested communities based on product description.

**Endpoint:** `GET /communities/suggestions`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `platform` (string, optional): Filter suggestions by platform

**Response:**
```json
{
  "suggestions": [
    {
      "platform": "reddit",
      "name": "r/Entrepreneur",
      "display_name": "Entrepreneur",
      "reason": "Active community discussing business challenges",
      "members": 4200000,
      "relevance_score": 95
    },
    {
      "platform": "twitter",
      "name": "#IndieHackers",
      "display_name": "Indie Hackers",
      "reason": "Founders sharing their journey and seeking tools",
      "followers": 150000,
      "relevance_score": 88
    }
  ]
}
```

---

## Keywords

Keywords are search terms used to find relevant conversations.

### List Keywords

**Endpoint:** `GET /keywords`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "items": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "keyword": "analytics tool",
      "is_active": true,
      "match_count": 142,
      "created_at": "2026-01-15T10:00:00Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "keyword": "data visualization",
      "is_active": true,
      "match_count": 89,
      "created_at": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 2
}
```

---

### Add Keyword

**Endpoint:** `POST /keywords`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
Content-Type: application/json
```

**Request:**
```json
{
  "keyword": "business intelligence"
}
```

**Response:**
```json
{
  "id": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
  "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "keyword": "business intelligence",
  "is_active": true,
  "match_count": 0,
  "created_at": "2026-01-30T12:00:00Z"
}
```

---

### Delete Keyword

**Endpoint:** `DELETE /keywords/{keyword_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Keyword removed successfully",
  "id": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f"
}
```

---

## Leads

Leads are social media posts identified as potential engagement opportunities.

### List Leads

Get all leads with filtering and pagination.

**Endpoint:** `GET /leads`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `status` (string, optional): Filter by status (unread, completed, discarded)
- `platform` (string, optional): Filter by platform (reddit, twitter, linkedin)
- `community_id` (string, optional): Filter by community
- `min_relevancy` (integer, optional): Minimum relevancy score (0-100)
- `max_relevancy` (integer, optional): Maximum relevancy score (0-100)
- `search` (string, optional): Search in title, content, author
- `cursor` (string, optional): Pagination cursor
- `limit` (integer, optional): Number of items per page. Default: 20

**Response:**
```json
{
  "items": [
    {
      "id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
      "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "platform": "reddit",
      "community": "r/SaaS",
      "author_name": "John Doe",
      "author_handle": "u/johndoe123",
      "title": "Looking for an analytics tool that doesn't break the bank",
      "content": "I'm running a small SaaS with about 5k users and need better analytics. Google Analytics is too complex and Mixpanel is too expensive. Any recommendations?",
      "url": "https://reddit.com/r/SaaS/comments/...",
      "relevancy_score": 92,
      "status": "unread",
      "keywords": ["analytics tool", "small SaaS"],
      "suggested_comment": "Hey John! I've been in the same boat...",
      "suggested_dm": "Hi John, I saw your post about analytics...",
      "post_created_at": "2026-01-30T10:30:00Z",
      "created_at": "2026-01-30T10:35:00Z"
    }
  ],
  "next_cursor": "eyJpZCI6ImQxZTJmM2E0LWI1YzYtN2Q4ZS05ZjBhLTFiMmMzZDRlNWY2YSJ9",
  "total": 156
}
```

---

### Get Lead by ID

**Endpoint:** `GET /leads/{lead_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
  "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "community_id": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
  "platform": "reddit",
  "platform_post_id": "abc123xyz",
  "platform_url": "https://reddit.com/r/SaaS/comments/abc123xyz",
  "title": "Looking for an analytics tool that doesn't break the bank",
  "content": "I'm running a small SaaS with about 5k users and need better analytics. Google Analytics is too complex and Mixpanel is too expensive. Any recommendations?",
  "author_name": "John Doe",
  "author_handle": "u/johndoe123",
  "author_url": "https://reddit.com/u/johndoe123",
  "relevancy_score": 92,
  "matched_keywords": ["analytics tool", "small SaaS"],
  "status": "unread",
  "suggested_comment": "Hey John! I've been in the same boat. For smaller SaaS companies, you might want to look into more affordable alternatives that still give you the insights you need...",
  "suggested_dm": "Hi John, I saw your post about analytics tools and wanted to reach out...",
  "user_reply": null,
  "replied_at": null,
  "post_created_at": "2026-01-30T10:30:00Z",
  "post_upvotes": 42,
  "post_comments": 18,
  "created_at": "2026-01-30T10:35:00Z",
  "updated_at": "2026-01-30T10:35:00Z"
}
```

---

### Update Lead Status

**Endpoint:** `PATCH /leads/{lead_id}/status`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "completed",
  "user_reply": "I ended up using the suggested comment with minor edits",
  "comment_sent": true,
  "dm_sent": false
}
```

**Response:**
```json
{
  "id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
  "status": "completed",
  "user_reply": "I ended up using the suggested comment with minor edits",
  "replied_at": "2026-01-30T12:45:00Z",
  "comment_sent": true,
  "dm_sent": false
}
```

---

### Regenerate AI Responses

Regenerate the suggested comment and DM for a lead.

**Endpoint:** `POST /leads/{lead_id}/regenerate`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `type` (string, optional): Type to regenerate (comment, dm, both). Default: both

**Response:**
```json
{
  "id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
  "suggested_comment": "New AI-generated comment...",
  "suggested_dm": "New AI-generated DM...",
  "updated_at": "2026-01-30T13:00:00Z"
}
```

---

### Bulk Discard Leads

Mark multiple leads as discarded.

**Endpoint:** `POST /leads/bulk-discard`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request:**
```json
{
  "lead_ids": [
    "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
    "e2f3a4b5-c6d7-8e9f-0a1b-2c3d4e5f6a7b"
  ],
  "reason": "Not relevant to our product"
}
```

**Response:**
```json
{
  "message": "2 leads discarded successfully",
  "count": 2
}
```

---

### Restore Lead

Restore a discarded lead back to unread status.

**Endpoint:** `POST /leads/{lead_id}/restore`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
  "status": "unread",
  "discarded_at": null,
  "updated_at": "2026-01-30T14:00:00Z"
}
```

---

## Prompts

Manage AI prompt templates for search, comment, and DM generation.

### Get Prompt Settings

**Endpoint:** `GET /prompts`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "search_prompt": "Find conversations where people are:\n1. Asking questions about analytics tools\n2. Discussing problems with data visualization...",
  "comment_prompt": "Hey [author_name], I saw your post about [topic]...",
  "dm_prompt": "Hi [author_name],\n\nI came across your post on [community]...",
  "updated_at": "2026-01-25T15:00:00Z"
}
```

---

### Update Prompt Settings

**Endpoint:** `PATCH /prompts`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
Content-Type: application/json
```

**Request:**
```json
{
  "search_prompt": "Updated search criteria...",
  "comment_prompt": "Updated comment template...",
  "dm_prompt": "Updated DM template..."
}
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "search_prompt": "Updated search criteria...",
  "comment_prompt": "Updated comment template...",
  "dm_prompt": "Updated DM template...",
  "updated_at": "2026-01-30T12:00:00Z"
}
```

---

### Reset Prompts to Defaults

**Endpoint:** `POST /prompts/reset`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "message": "Prompts reset to defaults",
  "prompts": {
    "search_prompt": "Default search prompt...",
    "comment_prompt": "Default comment template...",
    "dm_prompt": "Default DM template..."
  }
}
```

---

## Analytics

### Get Analytics Summary

Get summary metrics for a date range.

**Endpoint:** `GET /analytics/summary`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `start_date` (string, required): ISO 8601 date (e.g., 2026-01-01)
- `end_date` (string, required): ISO 8601 date
- `platform` (string, optional): Filter by platform

**Response:**
```json
{
  "total_leads": 347,
  "replies_sent": 142,
  "dms_sent": 67,
  "reply_rate": 40.92,
  "avg_relevancy_score": 78.5,
  "high_relevancy_leads": 189,
  "comparison": {
    "leads_change": 12.3,
    "replies_change": 8.7,
    "dms_change": -2.1,
    "reply_rate_change": 1.5
  }
}
```

---

### Get Leads Over Time

Get time-series data for leads and replies.

**Endpoint:** `GET /analytics/leads-over-time`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `start_date` (string, required): ISO 8601 date
- `end_date` (string, required): ISO 8601 date
- `granularity` (string, optional): day, week, month. Default: day

**Response:**
```json
{
  "data": [
    {
      "date": "2026-01-24",
      "leads": 18,
      "replies": 7,
      "dms": 3
    },
    {
      "date": "2026-01-25",
      "leads": 22,
      "replies": 9,
      "dms": 4
    },
    {
      "date": "2026-01-26",
      "leads": 15,
      "replies": 6,
      "dms": 2
    }
  ]
}
```

---

### Get Platform Performance

Get lead and reply breakdown by platform.

**Endpoint:** `GET /analytics/platform-performance`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `start_date` (string, required): ISO 8601 date
- `end_date` (string, required): ISO 8601 date

**Response:**
```json
{
  "data": [
    {
      "platform": "reddit",
      "leads": 203,
      "replies": 89,
      "dms": 42,
      "reply_rate": 43.8,
      "avg_relevancy": 81.2
    },
    {
      "platform": "twitter",
      "leads": 98,
      "replies": 38,
      "dms": 18,
      "reply_rate": 38.8,
      "avg_relevancy": 74.5
    },
    {
      "platform": "linkedin",
      "leads": 46,
      "replies": 15,
      "dms": 7,
      "reply_rate": 32.6,
      "avg_relevancy": 79.8
    }
  ]
}
```

---

### Get Top Communities

Get top performing communities by lead count and engagement.

**Endpoint:** `GET /analytics/top-communities`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `start_date` (string, required): ISO 8601 date
- `end_date` (string, required): ISO 8601 date
- `limit` (integer, optional): Number of communities to return. Default: 10

**Response:**
```json
{
  "data": [
    {
      "community_id": "c1d2e3f4-a5b6-7c8d-9e0f-1a2b3c4d5e6f",
      "community_name": "r/SaaS",
      "platform": "reddit",
      "leads": 89,
      "replies": 42,
      "reply_rate": 47.2,
      "avg_relevancy": 83.5
    },
    {
      "community_id": "d2e3f4a5-b6c7-8d9e-0f1a-2b3c4d5e6f7a",
      "community_name": "#B2BSaaS",
      "platform": "twitter",
      "leads": 67,
      "replies": 28,
      "reply_rate": 41.8,
      "avg_relevancy": 76.9
    }
  ]
}
```

---

### Export Analytics Data

Export analytics data as CSV or JSON.

**Endpoint:** `GET /analytics/export`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `start_date` (string, required): ISO 8601 date
- `end_date` (string, required): ISO 8601 date
- `format` (string, optional): csv or json. Default: csv
- `include` (string[], optional): Data to include (summary, leads, communities, platforms)

**Response:**
- For CSV: Returns CSV file download
- For JSON:
```json
{
  "summary": { ... },
  "leads_over_time": [ ... ],
  "platform_performance": [ ... ],
  "top_communities": [ ... ],
  "exported_at": "2026-01-30T14:00:00Z"
}
```

---

## Subscriptions

### Get Current Subscription

**Endpoint:** `GET /subscription`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "plan": "pro",
  "status": "active",
  "amount_cents": 4999,
  "currency": "usd",
  "current_period_start": "2026-01-01T00:00:00Z",
  "current_period_end": "2026-02-01T00:00:00Z",
  "cancel_at": null,
  "features": {
    "replies_limit": 200,
    "dms_limit": 100,
    "communities_limit": 50,
    "team_members_limit": 5,
    "ai_regenerations": "unlimited"
  }
}
```

---

### Create Checkout Session

Create a Stripe checkout session for upgrading.

**Endpoint:** `POST /subscription/checkout`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
Content-Type: application/json
```

**Request:**
```json
{
  "plan": "pro",
  "success_url": "https://app.replymer.com/settings/billing?success=true",
  "cancel_url": "https://app.replymer.com/settings/billing"
}
```

**Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "session_id": "cs_test_a1b2c3d4e5f6..."
}
```

---

### Upgrade Subscription

**Endpoint:** `POST /subscription/upgrade`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
Content-Type: application/json
```

**Request:**
```json
{
  "plan": "enterprise"
}
```

**Response:**
```json
{
  "message": "Subscription upgraded successfully",
  "subscription": {
    "plan": "enterprise",
    "status": "active",
    "amount_cents": 29900
  }
}
```

---

### Cancel Subscription

**Endpoint:** `POST /subscription/cancel`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `immediate` (boolean, optional): Cancel immediately vs. at period end. Default: false

**Response:**
```json
{
  "message": "Subscription will be canceled at period end",
  "cancel_at": "2026-02-01T00:00:00Z"
}
```

---

### Get Billing History

**Endpoint:** `GET /subscription/billing-history`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Query Parameters:**
- `limit` (integer, optional): Number of transactions. Default: 20

**Response:**
```json
{
  "items": [
    {
      "id": "tx_a1b2c3d4",
      "amount_cents": 4999,
      "currency": "usd",
      "description": "Pro Plan - Monthly",
      "status": "succeeded",
      "invoice_date": "2026-01-01T00:00:00Z",
      "paid_at": "2026-01-01T00:05:23Z",
      "invoice_url": "https://invoice.stripe.com/i/acct_..."
    },
    {
      "id": "tx_b2c3d4e5",
      "amount_cents": 4999,
      "currency": "usd",
      "description": "Pro Plan - Monthly",
      "status": "succeeded",
      "invoice_date": "2025-12-01T00:00:00Z",
      "paid_at": "2025-12-01T00:03:17Z",
      "invoice_url": "https://invoice.stripe.com/i/acct_..."
    }
  ],
  "total": 12
}
```

---

### Update Payment Method

**Endpoint:** `POST /subscription/payment-method`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "setup_url": "https://billing.stripe.com/p/session/test_...",
  "session_id": "bps_..."
}
```

---

## Usage

### Get Current Usage

Get usage statistics for the current billing period.

**Endpoint:** `GET /usage/current`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
  "period_start": "2026-01-01T00:00:00Z",
  "period_end": "2026-02-01T00:00:00Z",
  "replies_used": 47,
  "replies_limit": 200,
  "replies_remaining": 153,
  "replies_usage_percent": 23.5,
  "dms_used": 18,
  "dms_limit": 100,
  "dms_remaining": 82,
  "dms_usage_percent": 18.0,
  "overage": {
    "replies": 0,
    "dms": 0
  }
}
```

---

### Increment Usage

Increment usage counter when a reply or DM is sent.

**Endpoint:** `POST /usage/increment`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
Content-Type: application/json
```

**Request:**
```json
{
  "type": "reply",
  "lead_id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a"
}
```

**Response:**
```json
{
  "success": true,
  "replies_used": 48,
  "replies_limit": 200,
  "replies_remaining": 152,
  "warning": null
}
```

**Response (when approaching limit):**
```json
{
  "success": true,
  "replies_used": 190,
  "replies_limit": 200,
  "replies_remaining": 10,
  "warning": "You have used 95% of your monthly reply quota"
}
```

**Response (when limit exceeded):**
```json
{
  "success": false,
  "error": "Monthly reply limit exceeded",
  "replies_used": 200,
  "replies_limit": 200,
  "upgrade_url": "/settings/billing"
}
```

---

## Notifications

### List Notifications

**Endpoint:** `GET /notifications`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `unread_only` (boolean, optional): Only return unread notifications. Default: false
- `type` (string, optional): Filter by notification type
- `limit` (integer, optional): Number of items. Default: 20

**Response:**
```json
{
  "items": [
    {
      "id": "n1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
      "user_id": "ec064a37-b11a-4a7a-b965-2b752d3706a1",
      "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "subject": "New high-relevancy lead found",
      "body": "We found a lead with 95% relevancy in r/SaaS",
      "type": "lead_found",
      "details": {
        "lead_id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
        "relevancy_score": 95,
        "community": "r/SaaS"
      },
      "cta": "View Lead",
      "is_read": false,
      "created_at": "2026-01-30T10:35:00Z"
    },
    {
      "id": "n2b3c4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d",
      "user_id": "ec064a37-b11a-4a7a-b965-2b752d3706a1",
      "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
      "subject": "Approaching monthly limit",
      "body": "You've used 180 of 200 replies this month",
      "type": "quota_warning",
      "details": {
        "usage_percent": 90,
        "replies_remaining": 20
      },
      "cta": "Upgrade Plan",
      "is_read": true,
      "read_at": "2026-01-29T14:20:00Z",
      "created_at": "2026-01-29T12:00:00Z"
    }
  ],
  "unread_count": 12,
  "total": 47
}
```

---

### Mark Notification as Read

**Endpoint:** `PATCH /notifications/{notification_id}/read`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "n1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
  "is_read": true,
  "read_at": "2026-01-30T14:30:00Z"
}
```

---

### Mark All Notifications as Read

**Endpoint:** `POST /notifications/mark-all-read`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "All notifications marked as read",
  "count": 12
}
```

---

### Delete Notification

**Endpoint:** `DELETE /notifications/{notification_id}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "message": "Notification deleted successfully"
}
```

---

## Platform Connections

Manage OAuth connections to Reddit, Twitter, and LinkedIn for posting.

### Get Platform Connections

**Endpoint:** `GET /platform-connections`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "connections": [
    {
      "platform": "reddit",
      "is_connected": true,
      "username": "u/myusername",
      "last_used_at": "2026-01-30T11:45:00Z",
      "connected_at": "2026-01-15T10:00:00Z"
    },
    {
      "platform": "twitter",
      "is_connected": true,
      "username": "@myhandle",
      "last_used_at": "2026-01-29T16:20:00Z",
      "connected_at": "2026-01-15T10:05:00Z"
    },
    {
      "platform": "linkedin",
      "is_connected": false,
      "username": null,
      "last_used_at": null,
      "connected_at": null
    }
  ]
}
```

---

### Connect Platform

Initiate OAuth flow for a platform.

**Endpoint:** `POST /platform-connections/{platform}/connect`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "oauth_url": "https://www.reddit.com/api/v1/authorize?client_id=...",
  "state": "random_state_token"
}
```

---

### OAuth Callback

Handle OAuth callback after user authorizes.

**Endpoint:** `GET /platform-connections/callback`

**Query Parameters:**
- `code` (string): OAuth authorization code
- `state` (string): State token from connect request
- `platform` (string): Platform identifier

**Response:**
Redirects to app with success/error message

---

### Disconnect Platform

**Endpoint:** `DELETE /platform-connections/{platform}`

**Headers:**
```
Authorization: Bearer {access_token}
X-Project-ID: {project_id}
```

**Response:**
```json
{
  "message": "Platform disconnected successfully",
  "platform": "reddit"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "validation_error",
  "message": "Invalid input parameters",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired access token"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "conflict",
  "message": "Resource already exists",
  "details": {
    "field": "email",
    "value": "user@example.com"
  }
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "An unexpected error occurred",
  "request_id": "req_abc123"
}
```

---

## Rate Limiting

- **Authenticated requests:** 1000 requests per hour
- **Unauthenticated requests:** 100 requests per hour
- **Rate limit headers:**
  - `X-RateLimit-Limit`: Total requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp when limit resets

---

## Pagination

List endpoints use cursor-based pagination:

**Request:**
```
GET /leads?limit=20&cursor=eyJpZCI6ImFiYzEyMyJ9
```

**Response:**
```json
{
  "items": [...],
  "next_cursor": "eyJpZCI6ImRlZjQ1NiJ9",
  "has_more": true,
  "total": 347
}
```

---

## Webhooks

Replymer can send webhooks for important events.

### Available Events

- `lead.created` - New lead discovered
- `lead.completed` - Lead marked as completed
- `lead.high_relevancy` - Lead with relevancy > 90%
- `subscription.updated` - Subscription plan changed
- `subscription.canceled` - Subscription canceled
- `usage.quota_warning` - Usage at 80%
- `usage.quota_exceeded` - Usage limit reached

### Webhook Payload Example

```json
{
  "event": "lead.created",
  "timestamp": "2026-01-30T10:35:00Z",
  "data": {
    "lead_id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
    "project_id": "99ba73f4-96e5-4df5-b56c-6ffa35cac7dd",
    "platform": "reddit",
    "relevancy_score": 92,
    "url": "https://reddit.com/r/SaaS/comments/..."
  }
}
```

---

## Best Practices

1. **Authentication**: Always include `Authorization: Bearer {token}` header
2. **Project Context**: Include `X-Project-ID` header for project-scoped requests
3. **Pagination**: Use cursor-based pagination for large datasets
4. **Rate Limiting**: Implement exponential backoff for rate limit errors
5. **Error Handling**: Check error codes and display user-friendly messages
6. **Webhooks**: Verify webhook signatures for security
7. **Caching**: Cache static data like prompts and settings
8. **Idempotency**: Use idempotency keys for critical operations

---

## Changelog

### v1.0 (2026-01-30)
- Initial API release
- Authentication via magic link and Google OAuth
- Full CRUD for projects, communities, keywords, leads
- Analytics endpoints with time-series data
- Subscription management with Stripe integration
- Usage tracking and quota enforcement
- Platform OAuth connections
