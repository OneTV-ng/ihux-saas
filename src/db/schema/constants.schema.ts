
// Role definitions and permissions
export const ROLES = {
  GUEST: "guest" as const,           // Unregistered users (read-only access) - Power: 00
  NEW: "new" as const,               // Registered but unverified users - Power: 05
  MEMBER: "member" as const,         // Verified users (basic access) - Power: 10
  ARTIST: "artist" as const,         // Content creators - Power: 15
  BAND: "band" as const,             // Band accounts - Power: 20
  STUDIO: "studio" as const,         // Studio accounts - Power: 25
  CHOIR: "choir" as const,           // Choir accounts - Power: 30
  GROUP: "group" as const,           // Group accounts - Power: 35
  COMMUNITY: "community" as const,   // Community accounts - Power: 40
  LABEL: "label" as const,           // Label accounts - Power: 45
  EDITOR: "editor" as const,         // Content editors - Power: 50
  MANAGER: "manager" as const,       // Content managers - Power: 55
  ADMIN: "admin" as const,           // Administrators - Power: 60
  SADMIN: "sadmin" as const,         // Super administrators - Power: 65
};

export const ROLE_POWER_LEVELS = {
  guest: 0,
  new: 5,
  member: 10,
  artist: 15,
  band: 20,
  studio: 25,
  choir: 30,
  group: 35,
  community: 40,
  label: 45,
  editor: 50,
  manager: 55,
  admin: 60,
  sadmin: 65,
};

export const API_CLASSES = {
  BASIC: "5" as const,       // 100/page, no totals, 60 req/min (member, artist)
  STANDARD: "10" as const,   // 250/page, no totals, 120 req/min (band, studio, label, editor)
  ADVANCED: "20" as const,   // 500/page, see totals, 300 req/min (supervisor, manager)
  PREMIUM: "30" as const,    // 1000/page, see totals, 600 req/min (admin)
  UNLIMITED: "50" as const,  // Unlimited, see totals, unlimited req/min (sadmin)
};

export const ROLE_PERMISSIONS = {
  guest: {
    powerLevel: 0,
    apiClass: null,
    maxPerPage: 20,
    canSeeTotals: false,
    requestsPerMin: 10,
    canUpload: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  new: {
    powerLevel: 5,
    apiClass: null,
    maxPerPage: 20,
    canSeeTotals: false,
    requestsPerMin: 20,
    canUpload: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  member: {
    powerLevel: 10,
    apiClass: "5" as const,
    maxPerPage: 100,
    canSeeTotals: false,
    requestsPerMin: 60,
    canUpload: true,
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  artist: {
    powerLevel: 15,
    apiClass: "5" as const,
    maxPerPage: 100,
    canSeeTotals: false,
    requestsPerMin: 60,
    canUpload: true,
    canEdit: true,
    canDelete: true, // Can delete own content
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  band: {
    powerLevel: 20,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  studio: {
    powerLevel: 25,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  choir: {
    powerLevel: 30,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: false,
  },
  group: {
    powerLevel: 35,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: true,
  },
  community: {
    powerLevel: 40,
    apiClass: "20" as const,
    maxPerPage: 500,
    canSeeTotals: false,
    requestsPerMin: 300,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: true,
  },
  label: {
    powerLevel: 45,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: true,
  },
  editor: {
    powerLevel: 50,
    apiClass: "10" as const,
    maxPerPage: 250,
    canSeeTotals: false,
    requestsPerMin: 120,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: false,
    canFlag: true,
  },
  manager: {
    powerLevel: 55,
    apiClass: "20" as const,
    maxPerPage: 500,
    canSeeTotals: true,
    requestsPerMin: 300,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canApprove: true, // Can approve but not create/modify accounts
    canFlag: true,
  },
  admin: {
    powerLevel: 60,
    apiClass: "30" as const,
    maxPerPage: 1000,
    canSeeTotals: true,
    requestsPerMin: 600,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canApprove: true,
    canFlag: true,
  },
  sadmin: {
    powerLevel: 65,
    apiClass: "50" as const,
    maxPerPage: Infinity,
    canSeeTotals: true,
    requestsPerMin: Infinity,
    canUpload: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canApprove: true,
    canFlag: true,
  },
};

export type UserRole = keyof typeof ROLE_PERMISSIONS;
export type ApiClass = typeof API_CLASSES[keyof typeof API_CLASSES];
