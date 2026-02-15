# Mobile Admin Dashboard (`/m/admin`)

A comprehensive mobile-responsive admin interface for managing the SingFT platform on mobile devices. Built with Next.js 15+, React, and Tailwind CSS.

## Features

✅ **Mobile-First Design** - Optimized for phones and tablets
✅ **Bottom Navigation** - Easy thumb access to all sections
✅ **Admin-Only Access** - Protected routes with `requireAdmin()` middleware
✅ **Responsive Layouts** - Adapts to all screen sizes
✅ **Real-time Data Ready** - Placeholder data, easily replaceable with API calls

## Pages & Routes

### Dashboard (`/m/admin`)
- **Stats Overview**: Key metrics at a glance (Users, Verifications, Songs, KPI)
- **Quick Actions**: Fast navigation to major admin functions
- **Recent Activity**: Feed of platform activities
- **Navigation**: Bottom nav for quick access to all sections

### User Management (`/m/admin/users`)
- **User List**: Search and filter users
- **User Details** (`/m/admin/users/[id]`):
  - Full profile information
  - Verification status
  - Action buttons (view docs, send message, suspend)

### Verification (`/m/admin/verification`)
- **Pending Reviews**: List of verification requests with priorities
- **Filter Tabs**: All, Pending, Flagged, Verified
- **Verification Detail** (`/m/admin/verification/[id]`):
  - View user documents
  - Review notes
  - Approve/Reject/Flag decisions

### Song Publishing (`/m/admin/songs`)
- **Song List**: Browse all published and pending songs
- **Song Details** (`/m/admin/songs/[id]`): (Ready to extend)
  - Play counts and analytics
  - Publication status
  - Artist information

### Reports & KPI (`/m/admin/kpi`)
- **Key Metrics**: 6 important KPIs in grid layout
- **Top Artists**: Ranked artist list with streaming stats
- **Quick Insights**: Platform intelligence and alerts

### More & Settings (`/m/admin/more`)
- **Administration**: Permissions, System Settings, Notifications
- **Support**: Tickets and Logs
- **Account**: Sign out
- **System Info**: Version and status

### Settings (`/m/admin/settings`)
- **Toggle Controls**: General, Security, Content settings
- **Quick Configuration**: Maintenance mode, verification requirements, etc.
- **Save Functionality**: Ready for API integration

## Component Structure

```
src/
├── app/m/admin/
│   ├── layout.tsx           # Main layout with bottom nav & auth guard
│   ├── page.tsx             # Dashboard
│   ├── users/
│   │   ├── page.tsx         # User list
│   │   └── [id]/page.tsx    # User detail
│   ├── verification/
│   │   ├── page.tsx         # Verification list
│   │   └── [id]/page.tsx    # Verification detail
│   ├── songs/
│   │   ├── page.tsx         # Song list
│   │   └── [id]/page.tsx    # Song detail (ready)
│   ├── kpi/
│   │   └── page.tsx         # Reports & analytics
│   ├── more/
│   │   └── page.tsx         # Additional tools
│   ├── settings/
│   │   └── page.tsx         # Configuration
│   └── README.md
└── components/m-admin/
    └── mobile-admin-nav.tsx # Bottom navigation component
```

## Key Design Features

### Mobile-Optimized
- **Bottom Navigation**: Fixed navigation bar at bottom for thumb-friendly access
- **Card-Based Layout**: Easy tap targets and readable information hierarchy
- **Scroll Areas**: Main content scrollable with fixed header and footer
- **Responsive Grid**: 2-column grids that adapt to screen size

### User Experience
- **Breadcrumb Navigation**: Back buttons on detail pages
- **Status Badges**: Color-coded status indicators
- **Priority Indicators**: High-priority items highlighted
- **Action Buttons**: Clear, actionable CTAs on each section

### Performance
- **Server-Side Auth**: Admin check on layout (no client-side leaks)
- **Lazy Components**: Link-based routing with dynamic imports
- **Optimized Icons**: Lucide React for minimal bundle size

## Integration Points

### Authentication
```typescript
// Protected by requireAdmin() in layout.tsx
import { requireAdmin } from '@/lib/auth-server';
```

### Data Fetching
Replace mock data with API calls:
```typescript
// Example in users/page.tsx
const users = await db.select().from(userTable).limit(20);
```

### Real-Time Updates
Ready for WebSocket/Server-Sent Events integration for:
- Live user counts
- Pending verifications
- New song uploads
- Activity feeds

## Mobile Navigation

**Bottom Navigation Items:**
1. 📊 **Dashboard** - Main admin hub
2. 👥 **Users** - User management
3. ✓ **Verify** - Verification review
4. 🎵 **Songs** - Publishing management
5. ⋯ **More** - Additional tools

## Customization

### Changing Colors
Update Tailwind classes or use theme system:
```tsx
<div className="bg-primary text-primary-foreground">
```

### Adding New Sections
1. Create new folder under `src/app/m/admin/`
2. Add `page.tsx` with content
3. Update `mobile-admin-nav.tsx` navItems array

### Replacing Mock Data
```typescript
// Instead of:
const users = [{ id: 1, name: 'John', ... }];

// Use:
const users = await fetchUsers();
```

## Testing Checklist

- [ ] Mobile responsive on all breakpoints
- [ ] Bottom navigation works and shows active state
- [ ] All links navigate correctly
- [ ] Admin auth is enforced
- [ ] Search functionality ready to implement
- [ ] Detail pages have back navigation
- [ ] No overflow issues on smaller screens
- [ ] Touch-friendly button sizes (min 44px)

## Future Enhancements

- 📱 PWA support for offline capability
- 🔔 Push notifications for admin alerts
- 📊 Real-time chart updates
- 🔍 Advanced filtering and search
- 📄 Export reports functionality
- 👤 Admin user profiles
- 🎯 Custom admin roles with granular permissions

## Browser Support

- iOS Safari 14+
- Chrome Android
- Firefox Android
- Edge Mobile

## Performance Metrics

- Lighthouse Mobile: Target 90+
- FCP: < 2s
- LCP: < 3s
- CLS: < 0.1

---

Built for SingFT Admin Team | Mobile-First Architecture
