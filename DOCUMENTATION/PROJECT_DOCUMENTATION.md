# DXL Music HUB - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Architecture](#project-architecture)
4. [Features](#features)
5. [Getting Started](#getting-started)
6. [Authentication System](#authentication-system)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [File Structure](#file-structure)
10. [Theme System](#theme-system)
11. [Components](#components)
12. [Development Guide](#development-guide)
13. [Deployment](#deployment)

---

## Project Overview

**DXL Music HUB** is a comprehensive music distribution and artist management platform built with Next.js 16, featuring role-based authentication, multi-theme support, and a complete artist portal system.

### Key Capabilities
- **User Management**: Complete authentication with Better Auth
- **Artist Portal**: Multi-track album uploads, singles, medleys, and video content
- **Profile Management**: Comprehensive user profiles with social media and banking integration
- **Theme System**: 12 preset themes + 2 custom theme slots
- **Admin Dashboard**: Full user management and role-based access control
- **File Upload System**: Username-based folder structure for images, audio, and documents

---

## Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with App Router and Turbopack |
| **React** | 19 | UI library |
| **TypeScript** | 5.7.3 | Type safety |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |

### Backend & Database
| Technology | Version | Purpose |
|------------|---------|---------|
| **PostgreSQL** | Latest | Primary database |
| **Drizzle ORM** | 0.45.1 | Type-safe database queries |
| **Better Auth** | 1.4.7 | Authentication & session management |

### UI Components & Libraries
| Library | Purpose |
|---------|---------|
| **shadcn/ui** | Pre-built accessible components |
| **Radix UI** | Headless UI primitives |
| **Lucide React** | Icon library |
| **Framer Motion** | Animation library |
| **next-themes** | Dark/Light mode management |

### Form & Validation
| Library | Purpose |
|---------|---------|
| **React Hook Form** | Form state management |
| **Zod** | Schema validation |
| **Sonner** | Toast notifications |

### Development Tools
| Tool | Purpose |
|------|---------|
| **PM2** | Process manager for Node.js |
| **ESLint** | Code linting |
| **PostCSS** | CSS processing |

---

## Project Architecture

### Directory Structure
```
/var/app/singf/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (admin)/           # Admin routes
│   │   │   ├── admin/         # Admin panel
│   │   │   └── manager/       # Manager panel
│   │   ├── api/               # API routes
│   │   │   ├── admin/         # Admin APIs
│   │   │   ├── artist/        # Artist APIs
│   │   │   ├── auth/          # Auth APIs (Better Auth)
│   │   │   ├── dxl/           # DXL API integration
│   │   │   ├── profile/       # Profile API
│   │   │   └── upload/        # File upload API
│   │   ├── auth/              # Auth pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── resend-verification/
│   │   ├── dashboard/         # Main dashboard
│   │   ├── desk/              # Member area
│   │   │   ├── artist/        # Artist portal
│   │   │   ├── profile/       # User profile
│   │   │   └── settings/      # User settings
│   │   ├── api-demo/          # API demo page
│   │   ├── auth-demo/         # Auth demo page
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   │
│   ├── components/            # React components
│   │   ├── admin/             # Admin components
│   │   ├── auth/              # Auth forms
│   │   ├── landing/           # Landing page components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── mobile-bottom-nav.tsx
│   │   ├── page-breadcrumb.tsx
│   │   └── theme-toggle.tsx
│   │
│   ├── contexts/              # React contexts
│   │   ├── alert-context.tsx  # Alert system
│   │   └── auth-context.tsx   # Global auth state
│   │
│   ├── db/                    # Database
│   │   ├── index.ts           # Database connection
│   │   ├── schema.ts          # User schema
│   │   └── music-schema.ts    # Music schema
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.ts      # Mobile detection
│   │   └── use-toast.ts       # Toast notifications
│   │
│   ├── lib/                   # Utilities & configs
│   │   ├── auth.ts            # Better Auth config
│   │   ├── auth-client.ts     # Auth client
│   │   ├── auth-server.ts     # Server auth utilities
│   │   ├── config.ts          # App config
│   │   ├── dxl-api-client.ts  # DXL API client
│   │   ├── dxl-api-handler.ts # DXL API handler
│   │   ├── email.ts           # Email utilities
│   │   ├── pin-service.ts     # PIN service
│   │   ├── public-paths.ts    # Public routes
│   │   ├── schemas.ts         # Zod schemas
│   │   ├── themes.ts          # Theme system
│   │   ├── utils.ts           # Utility functions
│   │   └── handlers/          # Request handlers
│   │
│   └── utils/                 # Additional utilities
│       ├── auth.ts
│       └── users.ts
│
├── drizzle/                   # Database migrations
├── public/                    # Static assets
│   └── uploads/               # User uploads
│       └── {username}/        # Username-based folders
│           ├── images/
│           ├── audio/
│           └── documents/
├── DOCUMENTATION/             # Additional docs
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Features

### 1. Authentication System
- ✅ **Email/Password Authentication** with Better Auth
- ✅ **Session Management** with JWT tokens
- ✅ **Password Reset** with PIN verification
- ✅ **Email Verification** with resend functionality
- ✅ **Role-Based Access Control** (admin, user)
- ✅ **Global Auth Context** (client & server utilities)

### 2. User Profile Management
- ✅ **Personal Information**: Name, username, email, phone, WhatsApp, DOB, address
- ✅ **Social Media Integration**: Facebook, Instagram, Twitter, TikTok, YouTube, Spotify, Apple Music
- ✅ **Banking Details**: Bank name, account number, sort code, SWIFT, PayPal
- ✅ **Profile Picture Upload** with preview
- ✅ **Record Label** field
- ✅ **5-Tab Interface**: Personal, Social Media, Banking, Files, Security

### 3. File Upload System
- ✅ **Username-Based Folders**: `/uploads/{username}/{type}/`
- ✅ **File Types**: Images (JPG, PNG), Audio (MP3), Documents (PDF, DOC)
- ✅ **File Validation**: Type and size validation (10MB audio, 5MB others)
- ✅ **Preview Support**: Image preview, audio player, document display
- ✅ **Drag & Drop** functionality

### 4. Theme System
- ✅ **12 Preset Themes**:
  - Default (Classic Dark)
  - Ocean Blue
  - Sunset Orange
  - Forest Green
  - Royal Purple
  - Rose Pink
  - Cyberpunk (Neon)
  - Midnight Blue
  - Autumn Leaves
  - Mint Fresh
  - Lavender Dream
  - Monochrome
- ✅ **2 Custom Theme Slots**: Neon Glow, Tropical
- ✅ **Custom Color Picker**: Build your own theme
- ✅ **Dark/Light/System Mode** support
- ✅ **Settings Persistence** in user profile

### 5. Settings Management
- ✅ **Appearance Settings**: Theme selection, custom themes
- ✅ **Notification Preferences**: Email, Push, SMS toggles
- ✅ **Privacy Controls**: Profile visibility, show email/phone
- ✅ **General Settings**: Language, timezone
- ✅ **All settings saved** to user profile JSON field

### 6. Artist Portal (In Progress)
- ✅ **Upload Type Selector**: Album/EP, Single, Medley, Video
- 🔄 **Multi-track Album Upload** (planned)
- 🔄 **Single Track Upload** (planned)
- 🔄 **Medley Upload** (planned)
- 🔄 **Video Upload** (planned)

### 7. Admin Dashboard
- ✅ **User Management**: View, edit, delete users
- ✅ **Role Management**: Assign admin/user roles
- ✅ **User Actions**: Ban, unban, revoke sessions
- ✅ **User Cards**: Quick user overview
- ✅ **Admin-Only Access** with role-based guards

### 8. UI/UX Features
- ✅ **Breadcrumb Navigation**: Auto-generated from route
- ✅ **Mobile Bottom Navigation**: Mobile-first design
- ✅ **Responsive Design**: Mobile, tablet, desktop
- ✅ **Toast Notifications**: Success, error, info messages
- ✅ **Alert System**: Global alert bubbles
- ✅ **Loading States**: Skeleton loaders, spinners

---

## Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd singf
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   
   # Better Auth
   BETTER_AUTH_SECRET="your-secret-key-here"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # Email (if using email features)
   SMTP_HOST="smtp.example.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@example.com"
   SMTP_PASSWORD="your-password"
   SMTP_FROM="noreply@example.com"
   ```

4. **Run database migrations**
   ```bash
   pnpm drizzle-kit push
   # or
   npm run db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Using PM2 (production-like environment)**
   ```bash
   pm2 start npm --name "singf-dev" -- run dev
   pm2 logs singf-dev
   pm2 stop singf-dev
   ```

7. **Access the application**
   - Open http://localhost:3000 in your browser
   - Create an admin account at `/auth/signup`
   - Access admin panel at `/admin`

---

## Authentication System

### Client-Side Authentication

#### Using the `useAuth()` Hook
```tsx
import { useAuth } from "@/contexts/auth-context";

function MyComponent() {
  const {
    user,                    // Current user object
    session,                 // Current session
    defaultArtist,          // Default artist profile
    isLoading,              // Loading state
    isAuthenticated,        // Boolean: is user logged in?
    isAdmin,                // Boolean: is user admin?
    getUser,                // Function: get user
    setUser,                // Function: set user
    getSession,             // Function: get session
    setDefaultArtist,       // Function: set default artist
    getDefaultArtist,       // Function: get default artist
    refreshUser,            // Function: refresh user data
    signOut,                // Function: sign out
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome {user?.name}!</h1>
      {isAdmin && <p>You are an admin</p>}
      {defaultArtist && <p>Artist: {defaultArtist.name}</p>}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Server-Side Authentication

#### Using Server Utilities
```tsx
import { 
  getServerSession, 
  getServerUser, 
  getServerUserProfile,
  requireAuth,
  requireAdmin,
  isAdmin,
  isAuthenticated 
} from "@/lib/auth-server";

// In Server Components
async function MyServerComponent() {
  // Get current session
  const session = await getServerSession();
  
  // Get current user (basic info)
  const user = await getServerUser();
  
  // Get full user profile (with all fields)
  const profile = await getServerUserProfile();
  
  // Check if admin
  const adminStatus = await isAdmin();
  
  // Check if authenticated
  const authStatus = await isAuthenticated();
  
  return <div>User: {user?.name}</div>;
}

// In API Routes or Server Actions
async function myApiHandler() {
  // Require authentication (throws if not logged in)
  const session = await requireAuth();
  
  // Require admin (throws if not admin)
  const adminSession = await requireAdmin();
  
  // Your logic here
}
```

### User Object Structure
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  image?: string | null;
  role?: string;                    // "admin" | "user"
  phone?: string | null;
  whatsapp?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  recordLabel?: string | null;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    spotify?: string;
    appleMusic?: string;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    sortCode?: string;
    swiftCode?: string;
    paypalEmail?: string;
  };
  settings?: {
    theme?: string;
    customTheme?: object;
    notifications?: object;
    privacy?: object;
    language?: string;
    timezone?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
```

---

## Database Schema

### User Table (`user`)
```typescript
{
  id: string (primary key)
  name: string
  email: string (unique)
  username: string (nullable, unique)
  emailVerified: boolean
  image: string (nullable)
  role: string (default: "user")
  banned: boolean (default: false)
  banReason: string (nullable)
  banExpires: timestamp (nullable)
  phone: string (nullable)
  whatsapp: string (nullable)
  dateOfBirth: date (nullable)
  address: text (nullable)
  recordLabel: string (nullable)
  socialMedia: json (nullable)
  bankDetails: json (nullable)
  settings: json (nullable)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Session Table (`session`)
Managed by Better Auth - stores user sessions with JWT tokens.

### Account Table (`account`)
Managed by Better Auth - stores OAuth provider accounts.

### Verification Table (`verification`)
Managed by Better Auth - stores email verification tokens.

---

## API Endpoints

### Authentication APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/**` | Various | Better Auth endpoints (sign-in, sign-up, etc.) |

### Profile APIs
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/profile` | GET | Get current user profile | ✅ |
| `/api/profile` | PUT | Update user profile | ✅ |

### Artist APIs
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/artist/default` | GET | Get default artist for user | ✅ |

### Upload APIs
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/upload` | POST | Upload file (image/audio/document) | ✅ |

### Admin APIs
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/admin/users` | GET | Get all users | ✅ Admin |
| `/api/admin/users` | PUT | Update user (ban, role, etc.) | ✅ Admin |
| `/api/admin/users` | DELETE | Delete user | ✅ Admin |

### DXL APIs
| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/dxl/**` | Various | DXL music distribution APIs | ✅ |

---

## Theme System

### Using Themes

#### Apply a Preset Theme
```typescript
import { applyTheme } from "@/lib/themes";

// Apply a theme (with current mode)
applyTheme("ocean", "dark");
applyTheme("sunset", "light");
```

#### Apply a Custom Theme
```typescript
import { applyCustomTheme } from "@/lib/themes";

const customColors = {
  primary: "#10b981",
  secondary: "#8b5cf6",
  accent: "#f59e0b",
  background: "#09090b",
};

applyCustomTheme(customColors);
```

#### Get Available Themes
```typescript
import { themes } from "@/lib/themes";

themes.forEach(theme => {
  console.log(theme.id, theme.name, theme.description);
});
```

### Theme Structure
```typescript
interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
    muted: string;
  };
  cssVars: {
    light: Record<string, string>;
    dark: Record<string, string>;
  };
}
```

### Available Preset Themes
1. **Default** - Classic dark theme
2. **Ocean** - Blue tones
3. **Sunset** - Warm oranges
4. **Forest** - Natural greens
5. **Royal** - Elegant purples
6. **Rose** - Soft pinks
7. **Cyber** - Neon cyan/magenta
8. **Midnight** - Deep blues
9. **Autumn** - Browns/oranges
10. **Mint** - Cool mint
11. **Lavender** - Soft purples
12. **Monochrome** - Black/white

---

## Components

### UI Components (shadcn/ui)
All components in `/src/components/ui/`:
- `alert`, `alert-dialog`, `avatar`, `badge`, `breadcrumb`
- `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`
- `input`, `label`, `progress`, `select`, `sheet`
- `sonner` (toast), `switch`, `tabs`, `textarea`
- Custom: `alert-bubble`, `file-upload`

### Layout Components
- **Navbar** (`/components/landing/navbar.tsx`)
  - Uses `useAuth()` hook
  - Shows user avatar, role badge, artist badge
  - Dropdown menu with Profile, Settings, Admin Panel
  - Mobile sheet menu
  
- **PageBreadcrumb** (`/components/page-breadcrumb.tsx`)
  - Auto-generates breadcrumbs from URL
  - Shows Home > Path > Segments
  
- **MobileBottomNav** (`/components/mobile-bottom-nav.tsx`)
  - Fixed bottom navigation for mobile
  - Icons for Home, Profile, Upload, Settings

### Auth Components
Located in `/src/components/auth/`:
- `login-form.tsx` - Login form with validation
- `register-form.tsx` - Registration form
- `forgot-password-form.tsx` - Password reset request
- `reset-password-form.tsx` - Password reset with token
- `reset-password-with-pin-form.tsx` - PIN-based reset
- `password-input.tsx` - Password field with show/hide
- `resend-verification-form.tsx` - Resend verification email

### Admin Components
Located in `/src/components/admin/`:
- `users-table.tsx` - User management table
- `user-card.tsx` - User info card
- `user-actions.tsx` - User action buttons
- `user-ban-dialog.tsx` - Ban user dialog
- `user-unban-dialog.tsx` - Unban user dialog
- `user-role-dialog.tsx` - Change user role
- `user-delete-dialog.tsx` - Delete user
- `dashboard-layout.tsx` - Admin layout
- `dashboard-sidebar.tsx` - Admin sidebar

---

## Development Guide

### Running the Development Server
```bash
# Standard development
pnpm dev

# With PM2 (recommended for persistent server)
pm2 start npm --name "singf-dev" -- run dev
pm2 logs singf-dev
```

### Code Organization Best Practices

1. **Server Components vs Client Components**
   - Use Server Components by default
   - Add `"use client"` only when needed (hooks, interactivity)
   - Server components can use `getServerUser()`, `getServerSession()`
   - Client components use `useAuth()` hook

2. **API Routes**
   - Place in `/src/app/api/`
   - Use `getServerSession()` for authentication
   - Return proper error codes (401, 403, 404, 500)
   - Always validate input with Zod schemas

3. **Database Queries**
   - Use Drizzle ORM for type safety
   - Place reusable queries in `/src/lib/` or `/src/utils/`
   - Always use parameterized queries

4. **Components**
   - Keep components small and focused
   - Extract reusable logic into hooks
   - Use shadcn/ui components as base
   - Place shared components in `/src/components/ui/`

5. **Styling**
   - Use Tailwind CSS utility classes
   - Use CSS variables for theme colors
   - Follow the design system in theme configuration
   - Responsive: mobile-first approach

### Adding a New Feature

Example: Adding a new "Albums" feature

1. **Create Database Schema**
   ```typescript
   // src/db/music-schema.ts
   export const albums = pgTable("albums", {
     id: text("id").primaryKey(),
     title: text("title").notNull(),
     artistId: text("artist_id").notNull(),
     // ... more fields
   });
   ```

2. **Create API Route**
   ```typescript
   // src/app/api/albums/route.ts
   import { getServerSession } from "@/lib/auth-server";
   
   export async function GET() {
     const session = await getServerSession();
     // ... fetch albums
   }
   ```

3. **Create Page**
   ```typescript
   // src/app/desk/albums/page.tsx
   "use client";
   
   import { useAuth } from "@/contexts/auth-context";
   
   export default function AlbumsPage() {
     // ... component logic
   }
   ```

4. **Add Navigation**
   Update navbar, sidebar, or bottom nav to include new link

### Database Migrations
```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit push

# Open Drizzle Studio
pnpm drizzle-kit studio
```

### Environment Variables
Required environment variables:
```env
DATABASE_URL=               # PostgreSQL connection string
BETTER_AUTH_SECRET=         # Secret for JWT signing
BETTER_AUTH_URL=            # App URL (e.g., http://localhost:3000)
SMTP_HOST=                  # Email SMTP host
SMTP_PORT=                  # Email SMTP port
SMTP_USER=                  # Email user
SMTP_PASSWORD=              # Email password
SMTP_FROM=                  # Email from address
```

---

## Deployment

### Building for Production
```bash
# Build the application
pnpm build

# Test production build locally
pnpm start
```

### Deployment Options

#### Vercel (Recommended for Next.js)
1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables
4. Deploy

#### Docker
```dockerfile
# Example Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### PM2 (Production Server)
```bash
# Build application
pnpm build

# Start with PM2
pm2 start npm --name "singf" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Database Setup
1. Create PostgreSQL database
2. Set `DATABASE_URL` environment variable
3. Run migrations: `pnpm drizzle-kit push`
4. Seed initial data if needed

### Environment Variables (Production)
Ensure all environment variables are set:
- Set secure `BETTER_AUTH_SECRET` (use `openssl rand -base64 32`)
- Update `BETTER_AUTH_URL` to production URL
- Configure SMTP for email sending
- Set `NODE_ENV=production`

### Post-Deployment Checklist
- ✅ Database migrations applied
- ✅ Environment variables configured
- ✅ SMTP working (test password reset)
- ✅ File upload directory writable
- ✅ SSL certificate installed (HTTPS)
- ✅ Admin account created
- ✅ Error tracking configured (e.g., Sentry)
- ✅ Monitoring setup (e.g., PM2, Datadog)

---

## Troubleshooting

### Common Issues

**Issue: "Unauthorized" errors**
- Check if session is valid
- Verify `BETTER_AUTH_SECRET` matches
- Check if cookies are being sent

**Issue: Database connection errors**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Ensure network connectivity

**Issue: File uploads not working**
- Check `/public/uploads/` directory exists
- Verify write permissions
- Check file size limits in config

**Issue: Theme not applying**
- Clear browser cache
- Check if theme is saved in settings
- Verify CSS variables are loaded

**Issue: PM2 server not starting**
- Check PM2 logs: `pm2 logs`
- Verify Node.js version (20+)
- Check port 3000 is available

---

## Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://better-auth.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Project-Specific Docs
- `DOCUMENTATION/API_COMPREHENSIVE_GUIDE.md` - API integration guide
- `DOCUMENTATION/DXL_AUTH_API_GUIDE.md` - DXL auth system
- `DOCUMENTATION/INCREMENTAL_REGISTRATION_GUIDE.md` - Registration flow
- `DOCUMENTATION/BACKEND_BLUEPRINT_NODEJS.md` - Backend architecture

### Quick Reference Files
- `ALERT_SYSTEM_QUICK_REF.md` - Alert system usage
- `DXL_API_QUICK_REFERENCE.md` - DXL API endpoints
- `DXL_AUTH_QUICK_REF.md` - DXL auth quick ref

---

## Contributing

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful commit messages

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with clear commits
3. Test thoroughly (authentication, uploads, themes)
4. Update documentation if needed
5. Submit pull request with description

### Testing
- Test authentication flows (login, signup, password reset)
- Test file uploads (images, audio, documents)
- Test theme switching (all 12 themes + custom)
- Test admin functions (user management)
- Test mobile responsiveness

---

## License

See `LICENSE` file for details.

---

## Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: [support email if available]
- Documentation: Check `/DOCUMENTATION/` folder

---

**Last Updated:** February 9, 2026
**Version:** 1.0.0
**Maintainer:** DXL Music Team
