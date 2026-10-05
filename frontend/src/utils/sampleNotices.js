/**
 * Sample announcements for the Technophite Notice Board demonstration.
 */
export const SAMPLE_NOTICES = [
  {
    announcementId: 'sample-notice-1',
    title: 'Registration Deadline for Code Wars & Web Weavers Extended',
    category: 'Urgent',
    priority: 'urgent',
    pinned: true,
    isImportant: true,
    author: 'Technophite Event Committee',
    department: 'Department of Computer Science',
    message: 'Due to overwhelming demand from affiliated and external colleges across Karnataka, the registration deadline for Code Wars (Competitive Programming) and Web Weavers (Full-Stack Hack) has been officially extended until midnight.\n\nAll team heads must verify their team member credentials and contact info on the portal before registrations freeze.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    announcementId: 'sample-notice-2',
    title: 'Technophite 2026: Annual National Inter-College IT Fest Announced',
    category: 'Event',
    priority: 'high',
    pinned: true,
    isImportant: true,
    author: 'St. Joseph\'s University IT Association',
    department: 'School of Information Technology',
    message: 'We are thrilled to officially announce Technophite 2026! Featuring 15+ high-stakes technical, coding, gaming, and design events with over ₹1,50,000 in cash prizes.\n\nKeynote speaker sessions from top tech industry architects will be held in the Main Auditorium. Registration is now open to all undergraduate and postgraduate students.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  {
    announcementId: 'sample-notice-3',
    title: 'Hands-On Workshop: Building with Generative AI & Cloud Architecture',
    category: 'Workshop',
    priority: 'normal',
    pinned: false,
    isImportant: false,
    author: 'AI & Cloud Special Interest Group',
    department: 'Technophite Tech Wing',
    message: 'Join us this Friday at 2:00 PM in the PG Seminar Hall for a 3-hour hands-on masterclass on fine-tuning Large Language Models, Retrieval-Augmented Generation (RAG), and cloud deployment.\n\nParticipants must bring their own laptops with Node.js and Python 3.10+ pre-installed. Free entry for all verified Technophite attendees.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  },
  {
    announcementId: 'sample-notice-4',
    title: 'Guidelines & Code of Conduct for External College Participants',
    category: 'Guidelines',
    priority: 'normal',
    pinned: false,
    isImportant: false,
    author: 'Student Affairs & Discipline Committee',
    department: 'Office of Student Welfare',
    message: 'All external college teams must present their original institutional ID cards alongside their Technophite registration confirmation QR code at the main security check.\n\nCampus entry begins at 8:00 AM. Breakfast and refreshment coupons will be distributed at the welcome desk located in the central quadrangle.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
  },
  {
    announcementId: 'sample-notice-5',
    title: 'Flagship Esports & Gaming Championship Prize Pool Revealed',
    category: 'Prizes',
    priority: 'high',
    pinned: false,
    isImportant: false,
    author: 'Gaming & Esports Council',
    department: 'Technophite Association',
    message: 'The grand prize pool for the BGMI Squad Battle and Valorant Tactical Showdown has been officially increased to ₹40,000!\n\nCustom acrylic trophies, gold medals, and verified cryptographic certificates of excellence will be awarded to top finishers during the valedictory ceremony.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
  },
];
