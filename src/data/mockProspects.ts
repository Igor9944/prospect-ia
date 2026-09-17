import { Prospect } from '../types';

export const INITIAL_PROSPECTS: Prospect[] = [
  {
    id: 'pr-1',
    name: 'Sophie Laurent',
    role: 'Head of Growth & Acquisition',
    company: 'FinPulse SaaS',
    email: 'sophie.laurent@finpulse.io',
    phone: '+33 6 82 45 19 20',
    linkedin: 'linkedin.com/in/sophie-laurent-growth',
    location: 'Paris, France',
    industry: 'Fintech / SaaS',
    stage: 'engaged',
    fitScore: 94,
    intentScore: 89,
    status: 'hot',
    companySize: '50 - 150 employees',
    estimatedRevenue: '$8M - $15M ARR',
    techStack: ['Segment', 'HubSpot', 'Stripe', 'Mixpanel', 'React'],
    painPoints: [
      'High outbound acquisition costs on paid ads',
      'Inconsistent outbound email deliverability to enterprise leads',
      'SDR team spending 14 hours/week on manual prospect research'
    ],
    buyingTriggers: [
      'Announced $12M Series A funding last month',
      'Actively hiring 6 account executives in EMEA'
    ],
    summary: 'FinPulse offers automated billing reconciliation for European SMBs. Growing 80% YoY with high executive focus on scaling outbound B2B conversion.',
    lastActivity: '12 minutes ago',
    notes: 'Very interested in reducing SDR manual qualification cycles. Prefers short, metrics-driven proposals.',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'pr-2',
    name: 'Marcus Vance',
    role: 'VP of Sales & Revenue Operations',
    company: 'AuraCloud Infrastructure',
    email: 'marcus.vance@auracloud.com',
    phone: '+1 (415) 890-3412',
    linkedin: 'linkedin.com/in/marcus-vance-cloud',
    location: 'San Francisco, CA',
    industry: 'Cloud Infrastructure',
    stage: 'discovered',
    fitScore: 91,
    intentScore: 82,
    status: 'hot',
    companySize: '200 - 500 employees',
    estimatedRevenue: '$35M - $60M ARR',
    techStack: ['Salesforce', 'Outreach.io', 'Datadog', 'Kubernetes', 'GCP'],
    painPoints: [
      'Low reply rates on generic cold outreach campaigns',
      'Need for automated ICP scoring to prioritize high-value deals',
      'Disconnect between marketing qualified leads and sales acceptance'
    ],
    buyingTriggers: [
      'New VP of Sales appointed (Marcus joined 60 days ago)',
      'Enterprise expansion into London and Berlin'
    ],
    summary: 'AuraCloud provides autonomous cloud cost optimization. Scaling their enterprise sales pod and looking for AI tooling to personalize outreach at scale.',
    lastActivity: '1 hour ago',
    notes: 'Recently published a post discussing outbound sales efficiency challenges.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'pr-3',
    name: 'Camila Duarte',
    role: 'Director of Business Development',
    company: 'NexTrade Logistics',
    email: 'c.duarte@nextrade.br',
    phone: '+55 11 98765-4321',
    linkedin: 'linkedin.com/in/camiladuarte-log',
    location: 'São Paulo, Brazil',
    industry: 'Supply Chain & Logistics',
    stage: 'contacted',
    fitScore: 87,
    intentScore: 78,
    status: 'warm',
    companySize: '100 - 250 employees',
    estimatedRevenue: '$18M ARR',
    techStack: ['Zoho CRM', 'SAP', 'WhatsApp Business API', 'Tableau'],
    painPoints: [
      'Heavy reliance on manual WhatsApp follow-ups with key accounts',
      'Need bilingual outreach (Portuguese & English) for cross-border shipping',
      'Lack of clear prospect enrichment data before initial call'
    ],
    buyingTriggers: [
      'Opened a new logistics hub in Miami',
      'Targeting US e-commerce brands expanding to LATAM'
    ],
    summary: 'Next-gen freight forwarding and customs broker platform connecting South America with global suppliers.',
    lastActivity: '3 hours ago',
    notes: 'Sent initial LinkedIn introduction note. Waiting on response.',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'pr-4',
    name: 'David Lindqvist',
    role: 'Chief Commercial Officer',
    company: 'NordicHealth AI',
    email: 'david@nordichealth.se',
    phone: '+46 8 123 45 67',
    linkedin: 'linkedin.com/in/dlindqvist-health',
    location: 'Stockholm, Sweden',
    industry: 'HealthTech',
    stage: 'meeting',
    fitScore: 96,
    intentScore: 93,
    status: 'hot',
    companySize: '40 - 80 employees',
    estimatedRevenue: '$6M ARR',
    techStack: ['Pipedrive', 'Notion', 'Intercom', 'Next.js', 'PostgreSQL'],
    painPoints: [
      'Complex compliance questions during initial enterprise sales cycles',
      'Strict GDPR privacy requirements in outreach',
      'Long sales cycles with hospital networks'
    ],
    buyingTriggers: [
      'CE Mark certification approved for clinical AI platform',
      'Mandate from board to double commercial revenue in 12 months'
    ],
    summary: 'Clinical workflow automation for Nordic healthcare systems. High intent, evaluating solutions for targeted medical director prospecting.',
    lastActivity: 'Yesterday',
    notes: 'Demo scheduled for Thursday at 14:00 CET. Wants to see cold outreach samples targeting Chief Medical Officers.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'pr-5',
    name: 'Elena Rostova',
    role: 'VP of Commercial Strategy',
    company: 'Solaria Solar Solutions',
    email: 'elena.rostova@solariapower.com',
    phone: '+49 30 99887766',
    linkedin: 'linkedin.com/in/elena-rostova-clean',
    location: 'Berlin, Germany',
    industry: 'CleanTech / Energy',
    stage: 'won',
    fitScore: 92,
    intentScore: 95,
    status: 'hot',
    companySize: '300 - 800 employees',
    estimatedRevenue: '$70M ARR',
    techStack: ['Microsoft Dynamics 365', 'LinkedIn Sales Nav', 'PowerBI'],
    painPoints: [
      'Commercial B2B rooftop solar projects require hyper-local building data',
      'Reaching facility managers and CFOs with customized ROI calculations'
    ],
    buyingTriggers: [
      'Germany industrial solar subsidy expansion',
      'Expanding commercial sales reps by 25 people'
    ],
    summary: 'Commercial renewable energy developer installing solar grids across German manufacturing plants.',
    lastActivity: '2 days ago',
    notes: 'Converted to Annual Enterprise plan. Onboarding kickoff scheduled.',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'pr-6',
    name: 'Julian Thorne',
    role: 'Founder & CEO',
    company: 'Apex Media Agency',
    email: 'julian@apexmedia.co.uk',
    phone: '+44 20 7946 0912',
    linkedin: 'linkedin.com/in/julian-thorne-apex',
    location: 'London, UK',
    industry: 'Digital Agency / MarTech',
    stage: 'nurturing',
    fitScore: 74,
    intentScore: 65,
    status: 'warm',
    companySize: '15 - 35 employees',
    estimatedRevenue: '$2.5M ARR',
    techStack: ['ClickUp', 'Slack', 'Meta Ads Manager', 'Shopify Plus'],
    painPoints: [
      'Client churn replacement needing consistent incoming lead flow',
      'Agency bandwidth constrained by manual proposal building'
    ],
    buyingTriggers: [
      'Rebranding agency positioning towards high-ticket DTC brands'
    ],
    summary: 'Boutique paid-media agency scaling DTC eCommerce brands. Re-engaging after their Q3 budget review.',
    lastActivity: '5 days ago',
    notes: 'Follow up in late October when budget refreshes.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  }
];
