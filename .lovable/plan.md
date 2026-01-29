

# AI-Powered Reply & Outreach Platform Dashboard

## Overview
Transform the existing admin panel into a complete AI-powered outreach dashboard for monitoring social conversations across Reddit, X/Twitter, and LinkedIn, generating AI replies/DMs, and tracking performance metrics.

---

## 1. Updated Sidebar Navigation

Restructure the main sidebar to include the new workflow-focused navigation:

**Primary Navigation:**
- **Inbox** - Main leads/opportunities view (with unread count badge)
- **Completed** - Successfully replied conversations
- **Discarded** - Marked as not relevant

**Secondary Navigation:**
- **Analytics** - Performance metrics and charts
- **Settings** (collapsible)
  - Product Setup - Product info & target audience
  - Communities - Monitored subreddits/platforms
  - Prompts - AI response customization
  - Team - Existing team management
  - Profile - User profile settings
  - Billing - Subscription & usage

**Footer Elements:**
- Brand selector dropdown (for multi-brand users)
- Usage quota progress bar (e.g., "47/100 replies used")
- Upgrade button

---

## 2. Inbox / Leads Page (Main Dashboard)

A three-panel layout for managing incoming leads:

**Left Panel - Filters:**
- Relevancy score slider (0-100%)
- Platform filter (Reddit, X, LinkedIn checkboxes)
- Community/keyword filter with post counts
- Date range selector

**Center Panel - Lead List:**
- Each lead card shows:
  - Relevancy score badge (color-coded)
  - Platform icon
  - Community/subreddit name
  - Post age (e.g., "2 hours ago")
  - Post title preview (truncated)
  - Unread/read visual indicator

**Right Panel - Lead Detail & Suggestions:**
- Full post content with author handle and timestamp
- Action buttons: "Not Relevant", "Complete", "Close"
- **Suggested Comment** card with:
  - AI-generated response text
  - Rewrite, Edit Prompt, Copy & Open buttons
- **Suggested DM** card with:
  - Personalized message script
  - Same action buttons

**Status Tabs:** All, Unread, Completed, Discarded (with count badges)

---

## 3. Completed Page

List view of all successfully handled leads:
- Filterable by platform, date, keyword
- Each item shows: original post, your reply, timestamp, engagement metrics (if available)
- Option to view original post

---

## 4. Discarded Page

Archive of leads marked as not relevant:
- Same list structure as Completed
- "Restore" action to move back to Inbox
- Bulk delete option

---

## 5. Analytics / Reports Page

Dashboard with performance visualizations:

**Summary Cards:**
- Total leads found
- Replies sent
- DMs sent
- Overall reply rate %

**Charts (using existing Recharts):**
- Leads & replies over time (line chart)
- Performance by platform (bar chart)
- Top performing keywords/communities (horizontal bar)
- Reply rate trends

**Filters:**
- Date range picker
- Platform selector
- Export to CSV button

---

## 6. Settings Pages

### Product Setup (new)
- Product name, website URL, description fields
- Target audience and value proposition
- Save/Cancel actions

### Communities & Keywords (new)
- Add/remove subreddits and communities with autocomplete
- Suggested communities based on product description
- Keyword/phrase input with tags
- Platform toggles (Reddit, X, LinkedIn)

### Prompts Customization (new)
- **Search Prompt Editor** - How the AI finds relevant posts
- **Comment Prompt Editor** - Template for public replies
- **DM Prompt Editor** - Template for direct messages
- Placeholders guide (e.g., `<product_name>`, `[recipient]`)
- Reset to default, Save, Cancel buttons

### Enhanced Billing
- Current plan display with quota usage bar
- Plan comparison cards (Starter, Pro, Enterprise)
- Payment method section
- Billing history table
- Upgrade/downgrade actions

---

## 7. Enhanced Onboarding Flow

Update the existing onboarding to include outreach setup:

**Step 1:** Terms agreement (existing)
**Step 2:** User details (existing)  
**Step 3:** Product information form (new)
**Step 4:** Select platforms & add initial communities/keywords (new)
**Step 5:** Plan selection (existing)

---

## 8. Mock Data Structure

Create realistic mock data for:
- 20-30 sample leads across all platforms
- Various relevancy scores and statuses
- Pre-generated AI responses and DM scripts
- Sample analytics data for charts

---

## Technical Approach

- **State Management:** React Context for leads, filters, and settings
- **Existing Components:** Leverage current Card, Button, Badge, Progress, Tabs, Slider components
- **New Components:** LeadCard, FilterPanel, PromptEditor, PlatformBadge
- **Styling:** Use existing gradient backgrounds, admin-card classes, and animation utilities
- **Charts:** Recharts (already installed) for analytics visualizations

