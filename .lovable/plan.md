

# Enhanced Analytics Charts with Fullscreen Mode and Per-Card Filtering

## Overview
Add interactive fullscreen capability and individual time range filtering to each analytics chart card. When users hover over a chart card, a fullscreen icon appears. Clicking it opens the chart in a fullscreen dialog. Each card will also have its own week/month/year filter in the top right corner.

---

## 1. Create StatisticCard Component

A new reusable component that wraps chart cards with:
- Hover state showing a fullscreen icon (top right, semi-transparent until hover)
- Click handler to open fullscreen dialog
- Individual time range filter dropdown (Week, Month, Year) in the header
- Props for title, children (chart content), and data

**File:** `src/components/analytics/StatisticCard.tsx`

```text
+------------------------------------------+
|  Title                    [Week v] [⛶]  |  <- Filter + fullscreen icon (visible on hover)
|                                          |
|           [Chart Content]                |
|                                          |
+------------------------------------------+
```

---

## 2. Create ChartDialog Component

A fullscreen dialog for displaying enlarged charts:
- Uses existing Dialog component from UI library
- Full viewport width/height with padding
- Same chart content rendered at larger size
- Close button (X) in top right
- Time range filter available in dialog header too

**File:** `src/components/analytics/ChartDialog.tsx`

---

## 3. Update AnalyticsPage

Refactor the three chart cards to use the new StatisticCard component:
- "Leads & Replies Over Time" (LineChart)
- "Performance by Platform" (BarChart)  
- "Top Performing Communities" (horizontal BarChart)

Each card will maintain its own filter state (timeRange: 'week' | 'month' | 'year')

---

## 4. Mock Data Updates

Extend `analyticsData` in mockLeads.ts to include data variants for different time ranges:
- Weekly data (7 data points)
- Monthly data (30 data points)
- Yearly data (12 monthly data points)

This allows each card to show appropriate data based on its selected filter.

---

## Technical Implementation Details

**Hover Effect:**
- Use Tailwind's `group` and `group-hover` utilities
- Fullscreen icon: `opacity-0 group-hover:opacity-100 transition-opacity`
- Icon from lucide-react: `Maximize2` or `Expand`

**Dialog Behavior:**
- Dialog content: `max-w-4xl w-full h-[80vh]`
- ResponsiveContainer inside dialog uses full available space
- Chart re-renders at larger size for better readability

**Filter Options:**
- Week (last 7 days)
- Month (last 30 days)  
- Year (last 12 months)

**State Management:**
- Each StatisticCard maintains its own `timeRange` state
- Parent passes data variants, child selects based on timeRange
- Dialog receives current filtered data and timeRange

---

## Component Structure

```text
AnalyticsPage
├── Header with global filters (existing)
├── Summary Cards (unchanged)
└── Chart Grid
    ├── StatisticCard (Leads Over Time)
    │   ├── CardHeader with title + filter + fullscreen icon
    │   ├── LineChart
    │   └── ChartDialog (when open)
    ├── StatisticCard (Platform Performance)
    │   ├── CardHeader with title + filter + fullscreen icon
    │   ├── BarChart
    │   └── ChartDialog (when open)
    └── StatisticCard (Top Communities)
        ├── CardHeader with title + filter + fullscreen icon
        ├── BarChart (horizontal)
        └── ChartDialog (when open)
```

---

## Files to Create
1. `src/components/analytics/StatisticCard.tsx` - Reusable card wrapper with hover/fullscreen/filter
2. `src/components/analytics/ChartDialog.tsx` - Fullscreen dialog for charts

## Files to Modify
1. `src/pages/AnalyticsPage.tsx` - Use new StatisticCard component for each chart
2. `src/data/mockLeads.ts` - Add week/month/year data variants for analytics

