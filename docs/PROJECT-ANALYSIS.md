# Replymer - Comprehensive Project Analysis

**Analysis Date:** January 30, 2026
**Project Type:** AI-Powered Social Media Lead Generation Platform
**Technology Stack:** React 18 + TypeScript + Vite + TanStack Query + shadcn/ui

---

## Executive Summary

**Replymer** is an intelligent social media monitoring and engagement platform designed to help businesses discover and respond to high-intent conversations across Reddit, Twitter/X, and LinkedIn. The platform uses AI to identify relevant discussions, score them by relevancy, and generate contextual, authentic engagement suggestions.

### Core Value Proposition

Replymer solves the challenge of finding potential customers in social media conversations at scale by:

1. **Automated Discovery**: Monitors configured communities and keywords 24/7
2. **AI Relevancy Scoring**: Ranks conversations by fit (0-100%)
3. **Smart Response Generation**: Creates non-promotional, value-first replies
4. **Multi-Brand Management**: Supports multiple products per account
5. **Usage-Based Billing**: Tiered plans with reply quotas

---

## Application Architecture

### Frontend Structure

```
/home/user/replymer/
├── src/
│   ├── components/
│   │   ├── admin/          # Sidebar, header, navigation
│   │   ├── analytics/      # Charts and visualizations
│   │   ├── leads/          # Lead cards, filters, actions
│   │   └── ui/             # 50+ shadcn/ui components
│   ├── context/
│   │   └── LeadsContext.tsx    # Global state management
│   ├── pages/
│   │   ├── Auth.tsx            # Magic link + Google OAuth
│   │   ├── Onboarding.tsx      # 3-step setup wizard
│   │   ├── Inbox.tsx           # Main lead management
│   │   ├── Completed.tsx       # Replied leads
│   │   ├── Discarded.tsx       # Irrelevant leads
│   │   ├── Analytics.tsx       # Metrics dashboard
│   │   └── settings/
│   │       ├── ProductPage.tsx     # Product details
│   │       ├── CommunitiesPage.tsx # Platform & community setup
│   │       ├── PromptsPage.tsx     # AI prompt customization
│   │       ├── TeamPage.tsx        # Team management
│   │       ├── ProfilePage.tsx     # User settings
│   │       └── BillingPage.tsx     # Subscription & usage
│   └── data/
│       └── mockLeads.ts        # Sample data (to be replaced)
```

### Current Implementation Status

**✅ Complete:**
- Full UI/UX design and components
- Client-side routing and navigation
- Mock data and state management
- Onboarding flow
- Lead filtering and search
- Analytics visualizations
- Settings pages
- Theme support (light/dark)

**⚠️ In Progress:**
- Backend API implementation
- Database setup
- AI integrations (OpenAI/Anthropic)
- Social media API connections
- Stripe billing integration
- Background monitoring jobs

---

## Page-by-Page Analysis

### 1. Authentication (`/auth`)

**Purpose:** Passwordless authentication via magic link or Google OAuth

**UI Components:**
- Email input form
- Google Sign-In button
- Magic link confirmation

**Backend Requirements:**
- Magic token generation and validation
- JWT token issuance
- Google OAuth integration
- Session management

**Database Tables:**
- `users`
- `magic_tokens`

**API Endpoints:**
- `POST /signin` - Request magic link
- `POST /signin/confirm` - Verify token
- `POST /signin/google` - Google OAuth

---

### 2. Onboarding (`/onboarding`)

**Purpose:** 3-step wizard for new user setup

**Steps:**
1. Accept terms and conditions
2. Enter name and basic info
3. Select subscription plan

**Plans Offered:**
- **Starter**: $19.99/mo - 50 replies/mo
- **Pro**: $49.99/mo - 200 replies/mo
- **Enterprise**: Custom pricing - Unlimited

**Backend Requirements:**
- User profile creation
- Subscription initialization
- Free trial setup
- Stripe checkout session

**Database Tables:**
- `users`
- `subscriptions`
- `usage_tracking`

**API Endpoints:**
- `PATCH /users/me` - Update profile
- `POST /subscription/checkout` - Create Stripe session

---

### 3. Inbox (`/inbox`) - Main Dashboard

**Purpose:** Primary lead management interface

**Layout:**
- **Left Panel:** Filters and search
  - Status tabs (All, Unread, Completed, Discarded)
  - Relevancy slider (0-100%)
  - Platform checkboxes (Reddit, Twitter, LinkedIn)
  - Community checkboxes (grouped by platform)
  - Text search

- **Middle Panel:** Lead list
  - Cards showing: platform, community, author, title, snippet
  - Relevancy score badge
  - Visual indicators for status
  - Sorted by date (newest first)

- **Right Panel:** Lead details
  - Full post content
  - Author info and link
  - Platform and community
  - Matched keywords
  - AI-generated comment suggestion
  - AI-generated DM suggestion
  - "Copy & Open" buttons
  - "Regenerate" option
  - "Mark as Completed" / "Not Relevant" actions

**User Workflow:**
1. Browse leads in the list
2. Click to view full details
3. Review AI-generated responses
4. Optionally regenerate suggestions
5. Copy text and open original post
6. Engage on the platform
7. Mark as completed

**Backend Requirements:**
- Lead retrieval with filtering
- Full-text search
- AI response generation
- Usage quota checking
- Status updates

**Database Tables:**
- `leads`
- `communities`
- `keywords`
- `prompt_settings`
- `usage_tracking`

**API Endpoints:**
- `GET /leads` - List with filters
- `GET /leads/{id}` - Get details
- `POST /leads/{id}/regenerate` - New AI responses
- `PATCH /leads/{id}/status` - Update status
- `POST /usage/increment` - Track usage

**Key Features:**
- Real-time filtering (no page reload)
- Infinite scroll pagination
- Keyboard shortcuts for quick actions
- Bulk selection and actions

---

### 4. Completed (`/completed`)

**Purpose:** Review leads that have been replied to

**UI Components:**
- List of completed leads
- Shows the reply that was sent
- Timestamp of completion
- Platform filter
- Search functionality

**Backend Requirements:**
- Filter leads by status=completed
- Display user_reply field

**API Endpoints:**
- `GET /leads?status=completed`

---

### 5. Discarded (`/discarded`)

**Purpose:** Manage leads marked as not relevant

**UI Components:**
- List of discarded leads
- Discard reason (optional)
- "Restore" button per lead
- Bulk delete option

**User Actions:**
- Restore lead back to unread
- Permanently delete

**Backend Requirements:**
- Soft delete support
- Restore functionality

**API Endpoints:**
- `GET /leads?status=discarded`
- `POST /leads/{id}/restore`
- `DELETE /leads/{id}` - Permanent deletion

---

### 6. Analytics (`/analytics`)

**Purpose:** Performance metrics and insights

**Summary Cards:**
- Total leads discovered
- Replies sent
- DMs sent
- Reply rate percentage

**Charts:**
1. **Leads & Replies Over Time** (Line chart)
   - X-axis: Dates
   - Y-axis: Count
   - Multiple series: Leads, Replies, DMs

2. **Performance by Platform** (Bar chart)
   - Reddit, Twitter, LinkedIn
   - Leads and replies per platform

3. **Top Performing Communities** (Horizontal bar chart)
   - Top 10 communities by lead count
   - Shows reply rate

**Filters:**
- Time range: 7 days, 30 days, 90 days
- Platform: All, Reddit, Twitter, LinkedIn
- Export button (CSV/JSON)

**Interactive Features:**
- Clickable chart legends (toggle series)
- Hover tooltips with detailed data
- Responsive design for mobile

**Backend Requirements:**
- Aggregated analytics data
- Time-series queries
- Platform and community breakdowns
- Export functionality

**Database Tables:**
- `analytics_daily`
- `community_analytics`
- `leads` (for real-time queries)

**API Endpoints:**
- `GET /analytics/summary`
- `GET /analytics/leads-over-time`
- `GET /analytics/platform-performance`
- `GET /analytics/top-communities`
- `GET /analytics/export`

---

### 7. Settings: Product Setup (`/settings/product`)

**Purpose:** Configure product/brand details for AI context

**Form Fields:**
- Product name
- Website URL
- Description (textarea)
- Target audience (textarea)
- Value proposition (textarea)

**Backend Requirements:**
- Update project details
- Used by AI for context

**Database Tables:**
- `projects`

**API Endpoints:**
- `GET /projects/{id}`
- `PATCH /projects/{id}`

---

### 8. Settings: Communities & Keywords (`/settings/communities`)

**Purpose:** Configure what to monitor

**Platform Toggles:**
- Enable/disable Reddit, Twitter, LinkedIn
- Visual on/off switches

**Communities Section:**
- List of monitored communities
- Grouped by platform
- Add new community input
- Delete button per community
- Lead count badge
- "AI Suggested Communities" button

**Keywords Section:**
- List of keywords
- Add new keyword input
- Delete button per keyword
- Match count

**Backend Requirements:**
- CRUD for communities and keywords
- AI-powered community suggestions
- Match count tracking

**Database Tables:**
- `communities`
- `keywords`
- `platform_credentials` (for API access)

**API Endpoints:**
- `GET /communities`
- `POST /communities`
- `DELETE /communities/{id}`
- `GET /communities/suggestions`
- `GET /keywords`
- `POST /keywords`
- `DELETE /keywords/{id}`

---

### 9. Settings: Prompt Customization (`/settings/prompts`)

**Purpose:** Customize AI behavior for each brand

**Three Prompt Editors:**

1. **Search Prompt** (How to identify relevant posts)
   - Defines criteria for relevancy
   - Looks for questions, problems, alternatives, frustrations

2. **Comment Prompt** (Template for public replies)
   - Structure for authentic, helpful comments
   - Placeholders: `[author_name]`, `[topic]`, `<product_name>`
   - Guidelines: 2-4 sentences, no direct pitching

3. **DM Prompt** (Template for direct messages)
   - Structure for private outreach
   - More personal, offers specific value
   - Under 100 words

**Features:**
- Large textarea editors
- Character count
- "Reset to Defaults" button
- Placeholder documentation
- Live preview (future)

**Backend Requirements:**
- Store and retrieve prompts per project
- Default prompt templates

**Database Tables:**
- `prompt_settings`

**API Endpoints:**
- `GET /prompts`
- `PATCH /prompts`
- `POST /prompts/reset`

---

### 10. Settings: Team (`/settings/team`)

**Purpose:** Manage team access

**Features:**
- Team name
- Member list with avatars
- Roles: Owner, Admin, Member
- Invite functionality
- Remove members

**Backend Requirements:**
- Multi-user support
- Role-based permissions
- Invitation emails

**Database Tables:**
- `team_members`
- `notifications`

**API Endpoints:**
- `GET /team_members`
- `POST /team_members/invite`
- `DELETE /team_members/{id}`

---

### 11. Settings: Profile (`/settings/profile`)

**Purpose:** User account settings

**Features:**
- First name, last name
- Email (read-only)
- Theme switcher (Light / Dark / System)
- Delete account button

**Backend Requirements:**
- User profile updates
- Theme preference storage
- Account deletion with data cleanup

**Database Tables:**
- `users`

**API Endpoints:**
- `GET /users/me`
- `PATCH /users/me`
- `DELETE /users/me`

---

### 12. Settings: Billing (`/settings/billing`)

**Purpose:** Subscription and payment management

**Current Plan Section:**
- Plan name and price
- Usage progress bar (e.g., 47/100 replies used)
- Period dates
- Upgrade/Change Plan button

**Plan Comparison:**
- Side-by-side plan cards
- Feature comparison
- Upgrade buttons

**Payment Method:**
- Card details (last 4 digits)
- Expiry date
- Update button

**Billing History:**
- Table of past invoices
- Date, description, amount, status
- Download invoice link

**Backend Requirements:**
- Stripe integration
- Usage tracking
- Invoice management

**Database Tables:**
- `subscriptions`
- `usage_tracking`
- `billing_transactions`

**API Endpoints:**
- `GET /subscription`
- `POST /subscription/checkout`
- `POST /subscription/upgrade`
- `POST /subscription/cancel`
- `GET /subscription/billing-history`
- `GET /usage/current`

---

## Multi-Brand Support

### Project Selector

**Location:** Sidebar (top)

**Functionality:**
- Dropdown showing all projects/brands
- Displays unread count badge per project
- Switching changes entire app context

**Screenshot Context:**
From the provided screenshot, the user has:
- "My Product" (appears twice - likely showing as selected and in dropdown)
- "Side Project"
- "Client A"
- Badge showing "12" unread items

**Implementation:**
- `X-Project-ID` header sent with all API requests
- Context switches client-side
- All data scoped to selected project

**Database Design:**
- All major tables have `project_id` foreign key
- Row-level security ensures isolation
- Team members can access multiple projects

---

## Data Model Summary

### Entity Relationships

```
users
  ├─ team_members ─> projects
  │                    ├─ communities
  │                    ├─ keywords
  │                    ├─ leads
  │                    ├─ prompt_settings
  │                    ├─ subscriptions
  │                    │    ├─ usage_tracking
  │                    │    └─ billing_transactions
  │                    ├─ analytics_daily
  │                    ├─ community_analytics
  │                    └─ platform_credentials
  └─ notifications
```

### Key Relationships

1. **Users ↔ Projects** (Many-to-Many via team_members)
   - Users can belong to multiple projects
   - Projects can have multiple users
   - Role-based access control

2. **Projects → Leads** (One-to-Many)
   - Each lead belongs to one project
   - Projects can have thousands of leads

3. **Communities → Leads** (One-to-Many)
   - Each lead comes from one community
   - Communities track lead count

4. **Projects → Subscriptions** (One-to-One)
   - Each project has one active subscription
   - Subscriptions determine usage limits

5. **Subscriptions → Usage Tracking** (One-to-Many)
   - One usage record per billing period
   - Tracks replies and DMs sent

---

## AI Integration Points

### 1. Lead Discovery and Scoring

**Service:** Social Media Monitoring

**Process:**
1. Background job monitors configured communities
2. Fetches new posts via platform APIs
3. Filters by keywords
4. Sends to AI for relevancy scoring
5. AI returns 0-100% score
6. Stores as new lead if score > threshold

**AI Prompt Context:**
- Product description
- Target audience
- Value proposition
- Custom search prompt
- Post content

**Recommended Models:**
- OpenAI GPT-4 for scoring
- Cost optimization: Cache product context

---

### 2. Response Generation

**Service:** AI Comment/DM Generator

**Process:**
1. User views lead or clicks "Regenerate"
2. API sends lead + context to AI
3. AI generates comment and DM
4. Returns formatted responses
5. Stores in lead record

**AI Prompt Context:**
- Product details
- Custom comment/DM prompts
- Post title and content
- Author name
- Community context
- Matched keywords

**Placeholder Replacement:**
- `<product_name>` → Project name
- `[author_name]` → Post author
- `[topic]` → Post title
- `[community]` → Community name

**Recommended Models:**
- OpenAI GPT-4 or Claude Sonnet for quality
- Temperature: 0.7 for creativity
- Max tokens: 300 for comments, 500 for DMs

---

### 3. Community Suggestions

**Service:** AI Community Recommender

**Process:**
1. User clicks "Suggest Communities"
2. API sends product context to AI
3. AI returns relevant communities per platform
4. User can add with one click

**AI Prompt:**
- Product description
- Target audience
- Industry and niche
- Current communities (to avoid duplicates)

---

## Background Jobs

### Job Queue Required

**Recommended:** Postgres pg_cron or external service (Inngest, Trigger.dev)

### 1. Social Media Monitor

**Frequency:** Every 15-30 minutes

**Process:**
1. Query all active communities
2. Fetch new posts since last check
3. Filter by keywords
4. Queue for AI scoring

**Platforms:**
- Reddit: Use PRAW or Snoowrap
- Twitter: Use Twitter API v2
- LinkedIn: Use LinkedIn API

---

### 2. AI Lead Scorer

**Frequency:** Real-time (triggered by monitor)

**Process:**
1. Receive new post data
2. Fetch project context
3. Send to AI for scoring
4. If score > 60%, create lead
5. Generate initial comment/DM suggestions
6. Send notification if score > 90%

---

### 3. Analytics Aggregator

**Frequency:** Daily at midnight

**Process:**
1. Calculate metrics for previous day
2. Insert into analytics_daily table
3. Update community lead counts
4. Calculate platform breakdowns

---

### 4. Usage Reset

**Frequency:** Monthly (start of billing period)

**Process:**
1. Query active subscriptions
2. Archive current usage_tracking
3. Create new period record
4. Reset counters to 0

---

### 5. Stripe Webhook Handler

**Frequency:** Real-time (event-driven)

**Process:**
1. Receive Stripe events
2. Validate signature
3. Update subscription status
4. Create billing transaction records
5. Send notifications to users

**Events to handle:**
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Security Considerations

### 1. Authentication & Authorization

- JWT tokens with expiry (24 hours)
- Refresh token rotation
- RBAC (Owner > Admin > Guest)
- Row-level security on database

### 2. API Security

- Rate limiting (1000 req/hour authenticated)
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS protection

### 3. Data Privacy

- Soft deletes for audit trails
- GDPR compliance (data export, deletion)
- Encrypted platform credentials
- PII handling in compliance with regulations

### 4. Social Media API Credentials

- Store OAuth tokens encrypted
- Rotate tokens before expiry
- Scope permissions to minimum required
- Handle revocations gracefully

---

## Performance Optimization

### 1. Database Indexes

**Critical indexes created in schema:**
- `leads(project_id, status)` - Fast filtering
- `leads(project_id, relevancy_score)` - Sorting
- Full-text search index on leads content
- Cursor pagination indexes

### 2. Caching Strategy

**Recommended caching:**
- Prompt settings (1 hour)
- Project details (1 hour)
- Analytics data (5 minutes)
- Community list (10 minutes)

### 3. Query Optimization

- Use views for common aggregations
- Materialize analytics data daily
- Cursor-based pagination (not offset)
- Avoid N+1 queries with eager loading

### 4. Frontend Performance

- TanStack Query for automatic caching
- Virtualized lists for long lead lists
- Lazy loading for images
- Code splitting by route

---

## Deployment Architecture

### Recommended Stack

**Frontend:**
- Vercel or Netlify (automatic from git push)
- CDN for static assets
- Environment variables for API URL

**Backend:**
- Node.js/Express or Python/FastAPI
- Deployed on Railway, Render, or Fly.io
- Auto-scaling based on load

**Database:**
- PostgreSQL on Supabase, Neon, or Railway
- Connection pooling (PgBouncer)
- Automated backups

**Background Jobs:**
- Inngest (recommended) or Trigger.dev
- Handles retries and monitoring
- Separate from web server

**Object Storage:**
- Cloudflare R2 or AWS S3
- For user uploads, exports

---

## Migration Path

### Phase 1: Backend Foundation (Week 1-2)

- [ ] Set up PostgreSQL database
- [ ] Run schema migrations
- [ ] Implement authentication endpoints
- [ ] Set up JWT middleware
- [ ] Create CRUD endpoints for projects
- [ ] Deploy to staging

### Phase 2: Core Features (Week 3-4)

- [ ] Implement leads endpoints with filtering
- [ ] Set up communities and keywords CRUD
- [ ] Integrate OpenAI/Anthropic for AI responses
- [ ] Implement prompt management
- [ ] Add analytics endpoints
- [ ] Replace mock data with API calls

### Phase 3: Social Media Integration (Week 5-6)

- [ ] Set up Reddit OAuth and monitoring
- [ ] Set up Twitter API integration
- [ ] Set up LinkedIn API integration
- [ ] Implement background monitoring jobs
- [ ] Test lead discovery pipeline

### Phase 4: Billing & Usage (Week 7-8)

- [ ] Integrate Stripe
- [ ] Implement subscription management
- [ ] Add usage tracking and quota enforcement
- [ ] Create billing webhook handler
- [ ] Test upgrade/downgrade flows

### Phase 5: Polish & Launch (Week 9-10)

- [ ] Add team collaboration features
- [ ] Implement notifications
- [ ] Performance optimization
- [ ] Security audit
- [ ] Beta testing
- [ ] Production launch

---

## Cost Estimates

### Monthly Operational Costs (at 100 users)

| Service | Cost | Notes |
|---------|------|-------|
| Database (Supabase) | $25 | Pro plan |
| Backend Hosting | $20 | Render or Railway |
| Frontend Hosting | $0 | Vercel free tier |
| OpenAI API | $500-2000 | Depends on usage |
| Stripe Fees | 2.9% + $0.30 | Per transaction |
| Reddit API | $0 | Free tier sufficient |
| Twitter API | $100 | Basic plan |
| LinkedIn API | Free | Organic API |
| **Total** | ~$645-2145 | Scales with users |

---

## Success Metrics

### Product Metrics

1. **Lead Discovery Rate**: Leads per project per day
2. **Relevancy Accuracy**: % of leads marked completed vs discarded
3. **Engagement Rate**: % of leads that get replied to
4. **Time to Reply**: Hours from lead creation to response
5. **User Retention**: Weekly/monthly active projects

### Business Metrics

1. **MRR**: Monthly recurring revenue
2. **Churn Rate**: Monthly subscription cancellations
3. **Upgrade Rate**: Starter → Pro → Enterprise
4. **Quota Utilization**: % of users hitting limits
5. **LTV/CAC Ratio**: Customer lifetime value vs acquisition cost

---

## Competitive Advantages

1. **Multi-Platform**: Reddit + Twitter + LinkedIn in one tool
2. **AI-Powered**: Automated scoring and response generation
3. **Authentic Engagement**: Non-promotional approach
4. **Multi-Brand**: Manage multiple products in one account
5. **Affordable**: Starting at $19.99/mo vs competitors at $99+
6. **Easy Setup**: 3-step onboarding, working in minutes

---

## Future Roadmap Ideas

### v2.0 Features

- [ ] Discord integration
- [ ] Slack notifications for high-score leads
- [ ] A/B testing for response templates
- [ ] Sentiment analysis
- [ ] Competitor mention tracking
- [ ] Auto-reply option (with approval workflow)
- [ ] Browser extension for quick replies
- [ ] Mobile app (React Native)

### v3.0 Features

- [ ] YouTube comment monitoring
- [ ] Facebook Groups
- [ ] Hacker News integration
- [ ] Product Hunt tracking
- [ ] Custom AI model fine-tuning
- [ ] White-label for agencies
- [ ] API for developers

---

## Conclusion

Replymer is a well-architected, modern SaaS application with clear product-market fit in the social media lead generation space. The codebase demonstrates strong frontend development practices, and the proposed backend architecture provides a scalable foundation for growth.

**Key Strengths:**
- Comprehensive UI/UX design
- Clear user workflows
- Modern tech stack
- Scalable data model
- AI-first approach

**Next Steps:**
1. Implement backend API (refer to `api-specification-extended.md`)
2. Set up database (refer to `database-schema-extended.sql`)
3. Integrate AI services
4. Connect social media APIs
5. Launch beta program

---

**Documentation Files:**
- `/docs/database-schema-extended.sql` - Complete database schema
- `/docs/api-specification-extended.md` - Full API documentation
- `/docs/PROJECT-ANALYSIS.md` - This document
