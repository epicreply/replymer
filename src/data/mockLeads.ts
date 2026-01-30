export type Platform = 'reddit' | 'twitter' | 'linkedin';
export type LeadStatus = 'unread' | 'completed' | 'discarded';

export interface Lead {
  id: string;
  platform: Platform;
  community: string;
  author: string;
  authorHandle: string;
  title: string;
  content: string;
  url: string;
  relevancyScore: number;
  status: LeadStatus;
  createdAt: Date;
  keywords: string[];
  suggestedComment: string;
  suggestedDM: string;
  reply?: string;
  repliedAt?: Date;
}

export interface Community {
  id: string;
  name: string;
  platform: Platform;
  leadCount: number;
}

export interface ProductSettings {
  name: string;
  websiteUrl: string;
  description: string;
  targetAudience: string;
  valueProposition: string;
}

export interface PromptSettings {
  searchPrompt: string;
  commentPrompt: string;
  dmPrompt: string;
}

// Mock communities
export const mockCommunities: Community[] = [
  { id: '1', name: 'r/Entrepreneur', platform: 'reddit', leadCount: 14 },
  { id: '2', name: 'r/SaaS', platform: 'reddit', leadCount: 8 },
  { id: '3', name: 'r/startups', platform: 'reddit', leadCount: 12 },
  { id: '4', name: 'r/marketing', platform: 'reddit', leadCount: 6 },
  { id: '5', name: '#startup', platform: 'twitter', leadCount: 9 },
  { id: '6', name: '#growthhacking', platform: 'twitter', leadCount: 5 },
  { id: '7', name: 'Startup Founders', platform: 'linkedin', leadCount: 7 },
  { id: '8', name: 'SaaS Growth', platform: 'linkedin', leadCount: 4 },
];

// Mock leads data
export const mockLeads: Lead[] = [
  {
    id: '1',
    platform: 'reddit',
    community: 'r/Entrepreneur',
    author: 'John Smith',
    authorHandle: 'u/johnsmith_startup',
    title: 'Looking for AI tools to automate customer outreach',
    content: 'Hey everyone! I\'m running a small SaaS company and spending way too much time on manual outreach. Does anyone know of good AI tools that can help automate finding potential customers on social media and generating personalized messages? Budget is around $100/month. Thanks!',
    url: 'https://reddit.com/r/Entrepreneur/comments/abc123',
    relevancyScore: 95,
    status: 'unread',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    keywords: ['AI tools', 'customer outreach', 'automation'],
    suggestedComment: 'Great question! As someone who\'s been in the same boat, I\'d recommend looking into tools that can monitor social conversations and generate contextual replies. The key is finding something that doesn\'t feel spammy but actually adds value to conversations. Happy to share more specifics if you\'re interested!',
    suggestedDM: 'Hey John! Saw your post about AI outreach tools. I\'ve been using a solution that monitors Reddit, Twitter, and LinkedIn for relevant conversations and helps generate personalized responses. It\'s been a game-changer for our lead gen. Would you be open to a quick chat about what\'s worked for us?',
  },
  {
    id: '2',
    platform: 'reddit',
    community: 'r/SaaS',
    author: 'Sarah Chen',
    authorHandle: 'u/sarahchen_dev',
    title: 'Best practices for cold outreach in 2024?',
    content: 'Cold emails are getting harder. What are you all doing for outreach these days? I\'ve heard social selling on LinkedIn and Reddit is working well. Any tips or tools you recommend?',
    url: 'https://reddit.com/r/SaaS/comments/def456',
    relevancyScore: 88,
    status: 'unread',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    keywords: ['cold outreach', 'social selling', 'LinkedIn'],
    suggestedComment: 'You\'re right that cold emails are tough now. Social selling has been much more effective for us. The trick is to engage authentically in communities where your target audience hangs out, rather than pitching directly. Building relationships first makes all the difference.',
    suggestedDM: 'Hi Sarah! Your question about cold outreach really resonated with me. We\'ve shifted almost entirely to social selling and it\'s been night and day. Would love to share some specific tactics that have worked for our B2B SaaS if you\'re interested!',
  },
  {
    id: '3',
    platform: 'twitter',
    community: '#startup',
    author: 'Mike Johnson',
    authorHandle: '@mikej_founder',
    title: 'Thread about scaling early-stage startups',
    content: 'Struggling to find my first 100 customers. Have a great product but distribution is killing me. Any founders willing to share what worked for them in the early days? Especially interested in organic growth strategies.',
    url: 'https://twitter.com/mikej_founder/status/123456',
    relevancyScore: 92,
    status: 'unread',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    keywords: ['first 100 customers', 'distribution', 'organic growth'],
    suggestedComment: 'Been there! What worked for us: 1) Engaging genuinely in communities where our users hang out 2) Sharing valuable content without pitching 3) Using AI to find relevant conversations at scale. Happy to elaborate on any of these!',
    suggestedDM: 'Hey Mike! Just saw your thread about finding first customers. Distribution is definitely the hardest part. We cracked it by focusing on social listening and engaging where our audience already was. If you\'re open to it, I\'d love to share some specifics that might help.',
  },
  {
    id: '4',
    platform: 'linkedin',
    community: 'Startup Founders',
    author: 'Emily Davis',
    authorHandle: 'emily-davis-ceo',
    title: 'Looking for growth marketing advice',
    content: 'As a B2B SaaS founder, I\'m constantly looking for new ways to reach potential customers. Traditional ads are expensive and content marketing takes forever. What are some unconventional growth strategies that have worked for you?',
    url: 'https://linkedin.com/posts/emily-davis-ceo/123',
    relevancyScore: 85,
    status: 'unread',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    keywords: ['growth marketing', 'B2B SaaS', 'unconventional strategies'],
    suggestedComment: 'Emily, one strategy that\'s been incredibly effective is social listening combined with authentic engagement. Instead of broadcasting, you join existing conversations where people are already talking about problems you solve. Much higher conversion than traditional methods.',
    suggestedDM: 'Hi Emily! Your post about unconventional growth strategies caught my eye. One thing that\'s worked amazingly for our B2B SaaS is monitoring social conversations and engaging authentically. Would love to connect and share more details if you\'re interested!',
  },
  {
    id: '5',
    platform: 'reddit',
    community: 'r/startups',
    author: 'Alex Turner',
    authorHandle: 'u/alexturner_tech',
    title: 'How do you handle lead generation as a solo founder?',
    content: 'I\'m a solo founder and lead gen is eating up all my time. I need to focus on product but also need customers. Anyone using automation tools that actually work and don\'t feel spammy?',
    url: 'https://reddit.com/r/startups/comments/ghi789',
    relevancyScore: 91,
    status: 'unread',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    keywords: ['solo founder', 'lead generation', 'automation'],
    suggestedComment: 'Solo founder here too - I totally get it! The key is finding tools that help you engage authentically at scale, not just blast messages. Look for solutions that monitor conversations and help you join relevant discussions naturally. Huge time saver!',
    suggestedDM: 'Hey Alex! As a fellow solo founder, I felt your pain reading this post. Lead gen used to eat up 50% of my time until I started using AI to find and engage with relevant conversations. It\'s been a game-changer. Happy to share what\'s working if you\'re interested!',
  },
  {
    id: '6',
    platform: 'twitter',
    community: '#growthhacking',
    author: 'Lisa Wang',
    authorHandle: '@lisawang_growth',
    title: 'Growth tactics for bootstrapped startups',
    content: 'What growth tactics are working for bootstrapped startups in 2024? Looking for low-cost, high-impact strategies. No paid ads, please!',
    url: 'https://twitter.com/lisawang_growth/status/789012',
    relevancyScore: 78,
    status: 'unread',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    keywords: ['growth tactics', 'bootstrapped', 'low-cost'],
    suggestedComment: 'One word: social listening! Find where your audience is discussing problems you solve, then join those conversations with genuine value. No ad spend needed, just smart engagement. Works incredibly well for bootstrapped companies.',
    suggestedDM: 'Hi Lisa! Loved your question about bootstrapped growth. One tactic that\'s been huge for us: using AI to find relevant conversations across Reddit, Twitter, and LinkedIn, then engaging authentically. Zero ad spend, great results. Want to know more?',
  },
  {
    id: '7',
    platform: 'reddit',
    community: 'r/marketing',
    author: 'David Park',
    authorHandle: 'u/davidpark_mktg',
    title: 'Anyone using AI for social media monitoring?',
    content: 'Looking into AI tools for monitoring brand mentions and relevant conversations across social platforms. Any recommendations? Specifically interested in Reddit and Twitter monitoring.',
    url: 'https://reddit.com/r/marketing/comments/jkl012',
    relevancyScore: 96,
    status: 'unread',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    keywords: ['AI', 'social media monitoring', 'brand mentions'],
    suggestedComment: 'This is definitely a growing space! The best tools I\'ve seen not only monitor conversations but also help you engage at scale with AI-generated responses. Key is finding one that keeps the human touch while saving time.',
    suggestedDM: 'Hey David! Just saw your post about AI social monitoring. I\'ve been deep in this space and would love to share what I\'ve learned about the different tools available. Mind if I send you a quick overview?',
  },
  {
    id: '8',
    platform: 'linkedin',
    community: 'SaaS Growth',
    author: 'Rachel Green',
    authorHandle: 'rachel-green-saas',
    title: 'Scaling customer acquisition for B2B SaaS',
    content: 'We\'ve hit product-market fit and now need to scale customer acquisition. What channels are working best for B2B SaaS companies right now? Open to both organic and paid strategies.',
    url: 'https://linkedin.com/posts/rachel-green-saas/456',
    relevancyScore: 82,
    status: 'unread',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    keywords: ['customer acquisition', 'B2B SaaS', 'scaling'],
    suggestedComment: 'Congrats on hitting PMF! For scaling acquisition, we\'ve had great success with a hybrid approach: social listening to find high-intent conversations combined with targeted content. The key is meeting potential customers where they\'re already discussing their problems.',
    suggestedDM: 'Hi Rachel! Congratulations on hitting PMF - that\'s huge! I\'d love to share some acquisition strategies that have worked really well for us, especially around social selling and community engagement. Would you be open to a quick call?',
  },
  {
    id: '9',
    platform: 'reddit',
    community: 'r/Entrepreneur',
    author: 'Tom Wilson',
    authorHandle: 'u/tomwilson_ent',
    title: 'Tired of cold calling, what else works?',
    content: 'Cold calling is dead for my industry. What modern approaches are you using to reach B2B customers? I\'ve heard about social selling but don\'t know where to start.',
    url: 'https://reddit.com/r/Entrepreneur/comments/mno345',
    relevancyScore: 87,
    status: 'completed',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    keywords: ['cold calling', 'B2B', 'social selling'],
    suggestedComment: 'Social selling is definitely the way to go! Start by identifying communities where your prospects hang out (Reddit, LinkedIn groups, Twitter). Then engage authentically in conversations before pitching. Takes time but converts way better.',
    suggestedDM: 'Hey Tom! Just replied to your post about moving beyond cold calling. Social selling has been transformative for us. If you want, I can share a step-by-step approach that\'s been working really well. Let me know!',
    reply: 'Social selling is definitely the way to go! Start by identifying communities where your prospects hang out...',
    repliedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
  },
  {
    id: '10',
    platform: 'twitter',
    community: '#startup',
    author: 'Jennifer Lee',
    authorHandle: '@jenniferlee_vc',
    title: 'Fundraising vs bootstrapping debate',
    content: 'Seeing a lot of founders choose bootstrapping over VC money lately. What\'s driving this shift? Is it sustainable for SaaS companies targeting enterprise?',
    url: 'https://twitter.com/jenniferlee_vc/status/345678',
    relevancyScore: 65,
    status: 'discarded',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    keywords: ['fundraising', 'bootstrapping', 'VC'],
    suggestedComment: 'Great observation! Many founders are realizing that efficient growth through organic channels (like social selling) makes bootstrapping more viable than ever. Lower CAC means less need for outside capital.',
    suggestedDM: 'Hi Jennifer! Interesting thread on bootstrapping vs VC. Happy to share perspectives from the bootstrapped side if you\'re researching this trend. Our approach to efficient customer acquisition has been key.',
  },
  // Add more leads for variety
  {
    id: '11',
    platform: 'reddit',
    community: 'r/SaaS',
    author: 'Chris Martin',
    authorHandle: 'u/chrismartin_saas',
    title: 'Need help with go-to-market strategy',
    content: 'Launching a new SaaS product next month. Any advice on go-to-market strategy for a bootstrapped startup? Budget is limited.',
    url: 'https://reddit.com/r/SaaS/comments/pqr678',
    relevancyScore: 84,
    status: 'unread',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    keywords: ['go-to-market', 'launching', 'bootstrapped'],
    suggestedComment: 'For a limited budget GTM, focus on community-led growth. Find where your target customers discuss problems, become a helpful voice, and build relationships before selling. Much more effective than paid ads when you\'re bootstrapped.',
    suggestedDM: 'Hey Chris! Congrats on the upcoming launch! With a limited budget, I\'d focus heavily on community-based growth. Happy to share our GTM playbook that worked without big ad spend if you\'re interested.',
  },
  {
    id: '12',
    platform: 'linkedin',
    community: 'Startup Founders',
    author: 'Maria Garcia',
    authorHandle: 'maria-garcia-founder',
    title: 'Sales automation tools recommendations',
    content: 'Our sales team is spending too much time on manual prospecting. Looking for automation tools that can help with lead discovery and initial outreach. Any recommendations?',
    url: 'https://linkedin.com/posts/maria-garcia-founder/789',
    relevancyScore: 93,
    status: 'unread',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    keywords: ['sales automation', 'prospecting', 'lead discovery'],
    suggestedComment: 'Maria, the biggest shift we made was from cold outreach to warm engagement. Tools that monitor social conversations and help you join relevant discussions naturally convert much better than traditional prospecting automation.',
    suggestedDM: 'Hi Maria! Your post about sales automation really resonated. We\'ve moved away from traditional prospecting to social listening + AI-assisted engagement. Results have been fantastic. Would love to share more if you\'re open to it!',
  },
  {
    id: '13',
    platform: 'reddit',
    community: 'r/marketing',
    author: 'Kevin Brown',
    authorHandle: 'u/kevinbrown_growth',
    title: 'Reddit marketing - is it worth it?',
    content: 'Thinking about adding Reddit to our marketing mix. Has anyone had success with Reddit marketing for B2B? What approach works best?',
    url: 'https://reddit.com/r/marketing/comments/stu901',
    relevancyScore: 89,
    status: 'completed',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    keywords: ['Reddit marketing', 'B2B', 'community marketing'],
    suggestedComment: 'Reddit can be gold for B2B if done right! The key is being genuinely helpful, not promotional. Find subreddits where your audience asks questions, provide real value, and build credibility over time. Works amazingly well.',
    suggestedDM: 'Hey Kevin! Just shared some thoughts on your Reddit marketing question. If you want to go deeper, I\'ve got a detailed playbook for B2B Reddit marketing that\'s worked really well for us. Happy to share!',
    reply: 'Reddit can be gold for B2B if done right! The key is being genuinely helpful...',
    repliedAt: new Date(Date.now() - 32 * 60 * 60 * 1000),
  },
  {
    id: '14',
    platform: 'twitter',
    community: '#growthhacking',
    author: 'Amanda White',
    authorHandle: '@amandawhite_mkt',
    title: 'Marketing automation overload',
    content: 'So many marketing automation tools, so little time. What\'s actually moving the needle for early-stage startups? Feeling overwhelmed by options.',
    url: 'https://twitter.com/amandawhite_mkt/status/567890',
    relevancyScore: 76,
    status: 'unread',
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    keywords: ['marketing automation', 'early-stage', 'tools'],
    suggestedComment: 'I feel you on the tool overload! For early-stage, I\'d focus on just one thing: finding and engaging with people already discussing problems you solve. Social listening tools that help with this have been our biggest ROI.',
    suggestedDM: 'Hey Amanda! Totally relate to the tool fatigue. Early on, we simplified to just one focus: finding relevant conversations and engaging authentically. Want to chat about what tools actually helped us cut through the noise?',
  },
  {
    id: '15',
    platform: 'reddit',
    community: 'r/startups',
    author: 'Brian Taylor',
    authorHandle: 'u/briantaylor_tech',
    title: 'Customer discovery for technical founders',
    content: 'As a technical founder, I find customer discovery really challenging. Any tools or frameworks that help identify and reach potential customers without being too salesy?',
    url: 'https://reddit.com/r/startups/comments/vwx234',
    relevancyScore: 90,
    status: 'unread',
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    keywords: ['customer discovery', 'technical founder', 'tools'],
    suggestedComment: 'Fellow technical founder here! The approach that clicked for me: use social listening to find people actively discussing problems in your space, then engage in those conversations naturally. Way easier than cold outreach for us tech types.',
    suggestedDM: 'Hey Brian! As a technical founder myself, I struggled with the same thing. Found that using AI to identify relevant conversations and then engaging authentically was way more natural for me than traditional sales. Happy to share what worked!',
  },
];

// Analytics mock data with time range variants
export const analyticsData = {
  // Weekly data (7 days)
  leadsOverTimeWeek: [
    { date: '2024-01-01', leads: 12, replies: 8, dms: 3 },
    { date: '2024-01-02', leads: 18, replies: 12, dms: 5 },
    { date: '2024-01-03', leads: 15, replies: 10, dms: 4 },
    { date: '2024-01-04', leads: 22, replies: 15, dms: 7 },
    { date: '2024-01-05', leads: 28, replies: 20, dms: 9 },
    { date: '2024-01-06', leads: 25, replies: 18, dms: 8 },
    { date: '2024-01-07', leads: 30, replies: 22, dms: 10 },
  ],
  // Monthly data (30 days - simplified to key points)
  leadsOverTimeMonth: [
    { date: '2024-01-01', leads: 45, replies: 32, dms: 12 },
    { date: '2024-01-05', leads: 52, replies: 38, dms: 15 },
    { date: '2024-01-10', leads: 38, replies: 28, dms: 10 },
    { date: '2024-01-15', leads: 65, replies: 48, dms: 20 },
    { date: '2024-01-20', leads: 72, replies: 55, dms: 22 },
    { date: '2024-01-25', leads: 58, replies: 42, dms: 18 },
    { date: '2024-01-30', leads: 80, replies: 62, dms: 25 },
  ],
  // Yearly data (12 months)
  leadsOverTimeYear: [
    { date: '2024-01', leads: 320, replies: 245, dms: 95 },
    { date: '2024-02', leads: 280, replies: 210, dms: 82 },
    { date: '2024-03', leads: 410, replies: 315, dms: 120 },
    { date: '2024-04', leads: 385, replies: 290, dms: 110 },
    { date: '2024-05', leads: 450, replies: 340, dms: 135 },
    { date: '2024-06', leads: 520, replies: 395, dms: 150 },
    { date: '2024-07', leads: 480, replies: 365, dms: 140 },
    { date: '2024-08', leads: 545, replies: 420, dms: 165 },
    { date: '2024-09', leads: 490, replies: 375, dms: 145 },
    { date: '2024-10', leads: 610, replies: 470, dms: 180 },
    { date: '2024-11', leads: 580, replies: 445, dms: 170 },
    { date: '2024-12', leads: 650, replies: 500, dms: 195 },
  ],
  // Platform performance by time range
  platformPerformanceWeek: [
    { platform: 'Reddit', leads: 45, replies: 32, replyRate: 71 },
    { platform: 'Twitter', leads: 28, replies: 18, replyRate: 64 },
    { platform: 'LinkedIn', leads: 22, replies: 15, replyRate: 68 },
  ],
  platformPerformanceMonth: [
    { platform: 'Reddit', leads: 180, replies: 130, replyRate: 72 },
    { platform: 'Twitter', leads: 120, replies: 78, replyRate: 65 },
    { platform: 'LinkedIn', leads: 95, replies: 68, replyRate: 72 },
  ],
  platformPerformanceYear: [
    { platform: 'Reddit', leads: 2100, replies: 1520, replyRate: 72 },
    { platform: 'Twitter', leads: 1450, replies: 945, replyRate: 65 },
    { platform: 'LinkedIn', leads: 1170, replies: 820, replyRate: 70 },
  ],
  // Top communities by time range
  topCommunitiesWeek: [
    { name: 'r/Entrepreneur', leads: 14, replies: 11 },
    { name: 'r/SaaS', leads: 12, replies: 9 },
    { name: 'r/startups', leads: 10, replies: 7 },
    { name: '#startup', leads: 9, replies: 6 },
    { name: 'Startup Founders', leads: 7, replies: 5 },
  ],
  topCommunitiesMonth: [
    { name: 'r/Entrepreneur', leads: 58, replies: 45 },
    { name: 'r/SaaS', leads: 48, replies: 38 },
    { name: 'r/startups', leads: 42, replies: 32 },
    { name: '#startup', leads: 38, replies: 28 },
    { name: 'Startup Founders', leads: 32, replies: 24 },
  ],
  topCommunitiesYear: [
    { name: 'r/Entrepreneur', leads: 680, replies: 520 },
    { name: 'r/SaaS', leads: 560, replies: 445 },
    { name: 'r/startups', leads: 490, replies: 375 },
    { name: '#startup', leads: 420, replies: 315 },
    { name: 'Startup Founders', leads: 380, replies: 285 },
  ],
  summary: {
    totalLeads: 95,
    repliesSent: 65,
    dmsSent: 28,
    replyRate: 68,
  },
};

// Default settings
export const defaultProductSettings: ProductSettings = {
  name: 'My Product',
  websiteUrl: 'https://myproduct.com',
  description: 'An AI-powered tool that helps businesses automate their social media outreach and lead generation.',
  targetAudience: 'B2B SaaS founders, marketing teams, and growth hackers looking to scale customer acquisition.',
  valueProposition: 'Save 10+ hours per week on manual outreach while increasing reply rates by 3x through AI-powered social listening and engagement.',
};

export const defaultPromptSettings: PromptSettings = {
  searchPrompt: `Find posts where users are:
- Asking for recommendations about <product_category>
- Discussing problems that <product_name> can solve
- Looking for alternatives to competitors
- Sharing frustrations with current solutions

Focus on high-intent signals like:
- Questions asking "what tool should I use"
- Complaints about existing solutions
- Requests for recommendations`,
  commentPrompt: `Write a helpful, non-promotional comment that:
- Acknowledges the user's specific problem or question
- Shares genuine insights or experience related to their issue
- Avoids directly pitching <product_name>
- Offers to share more details if they're interested
- Keeps a conversational, friendly tone
- Is 2-4 sentences maximum`,
  dmPrompt: `Write a personalized direct message that:
- References their specific post: [post_title]
- Acknowledges their pain point genuinely
- Briefly mentions how you've solved similar problems
- Offers value before asking for anything
- Suggests a low-commitment next step (quick call, share resources)
- Keeps it under 100 words
- Signs off with [your_name]`,
};

// Usage quota mock
export const usageQuota = {
  used: 47,
  limit: 100,
  plan: 'Pro',
};

// Mock brands for multi-brand users
export const mockBrands = [
  { id: '1', name: 'My Product', isActive: true },
  { id: '2', name: 'Side Project', isActive: false },
  { id: '3', name: 'Client A', isActive: false },
];
