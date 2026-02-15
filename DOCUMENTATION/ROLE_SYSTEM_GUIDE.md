# Role-Based Access Control (RBAC) System

## Overview
Complete role-based permission system based on the Universal Music Hub API Blueprint specification.

## Role Hierarchy

```
guest → new → member → artist → band → studio → label → editor → manager → admin → sadmin
```

### Role Definitions

| Role | Description | API Class | Max/Page | Req/Min | See Totals |
|------|-------------|-----------|----------|---------|------------|
| **guest** | Unregistered users | None | 20 | 10 | ❌ |
| **new** | Registered, unverified | None | 20 | 20 | ❌ |
| **member** | Verified basic users | 5 | 100 | 60 | ❌ |
| **artist** | Music artists | 5 | 100 | 60 | ❌ |
| **band** | Music bands | 5 | 100 | 60 | ❌ |
| **studio** | Recording studios | 10 | 250 | 120 | ❌ |
| **label** | Record labels | 10 | 250 | 120 | ❌ |
| **editor** | Content editors | 10 | 250 | 120 | ❌ |
| **manager** | Content managers | 10 | 250 | 120 | ❌ |
| **admin** | Administrators | 20 | 500 | 300 | ✅ |
| **sadmin** | Super administrators | 50 | Unlimited | Unlimited | ✅ |

## API Classes

### Class 5 - Basic Access
- **Roles**: member, artist, band
- **Rate Limit**: 60 requests/minute
- **Pagination**: Max 100 items per page
- **Totals**: Cannot see total counts
- **Use Case**: Individual creators and basic members

### Class 10 - Enhanced Access
- **Roles**: studio, label, editor, manager
- **Rate Limit**: 120 requests/minute
- **Pagination**: Max 250 items per page
- **Totals**: Cannot see total counts
- **Use Case**: Content management and production

### Class 20 - Premium Access
- **Roles**: admin
- **Rate Limit**: 300 requests/minute
- **Pagination**: Max 500 items per page
- **Totals**: Can see total counts
- **Use Case**: Platform administration

### Class 50 - Unlimited Access
- **Roles**: sadmin
- **Rate Limit**: Unlimited
- **Pagination**: Unlimited items per page
- **Totals**: Can see total counts
- **Use Case**: Super administration

## Permissions Matrix

| Action | guest | new | member | artist | band | studio | label | editor | manager | admin | sadmin |
|--------|-------|-----|--------|--------|------|--------|-------|--------|---------|-------|--------|
| Upload | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Edit | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Delete | ❌ | ❌ | ❌ | ✅* | ✅* | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

*Artists and bands can only delete their own content

## Role Categories

### Unverified
- `guest`: Unregistered visitors
- `new`: Registered but not email verified

### Content Creators
- `artist`: Individual music artists
- `band`: Music groups/bands

### Content Managers
- `studio`: Recording studio management
- `label`: Record label management
- `editor`: Content editing
- `manager`: Content management & approval

### Administrators
- `admin`: Platform administration
- `sadmin`: Super administration with full access

## Usage Examples

### Server-Side (Server Components & API Routes)

```typescript
import { getServerUser, hasRole, hasMinRole, requireRole, requireMinRole } from "@/lib/auth-server";
import { ROLES } from "@/db/schema";

// Check specific role
async function someServerFunction() {
  const hasArtistRole = await hasRole(ROLES.ARTIST);
  if (!hasArtistRole) {
    throw new Error("Artist role required");
  }
}

// Check minimum role level
async function someAdminFunction() {
  const canAccess = await hasMinRole(ROLES.ADMIN);
  if (!canAccess) {
    throw new Error("Admin access required");
  }
}

// Require specific role (throws error if not met)
async function artistOnlyFunction() {
  await requireRole(ROLES.ARTIST);
  // ... artist-specific logic
}

// Require minimum role level
async function managerAndAboveFunction() {
  await requireMinRole(ROLES.MANAGER);
  // ... manager+ logic
}
```

### Client-Side (Client Components)

```typescript
"use client";

import { useAuth } from "@/contexts/auth-context";
import { ROLES } from "@/db/schema";

function MyComponent() {
  const { user, userRole, userPermissions, hasRole, hasMinRole, canPerformAction } = useAuth();

  // Check specific role
  const isArtist = hasRole(ROLES.ARTIST);

  // Check minimum role level
  const canManage = hasMinRole(ROLES.MANAGER);

  // Check specific permission
  const canUpload = canPerformAction("canUpload");
  const canApprove = canPerformAction("canApprove");

  // Get current role info
  console.log("Current role:", userRole);
  console.log("API Class:", userPermissions?.apiClass);
  console.log("Max per page:", userPermissions?.maxPerPage);

  return (
    <div>
      {isArtist && <ArtistDashboard />}
      {canManage && <ManagerTools />}
      {canUpload && <UploadButton />}
    </div>
  );
}
```

### API Route Middleware

```typescript
import { withRoleAuth } from "@/lib/role-middleware";
import { ROLES } from "@/db/schema";

// Require specific roles
export const GET = withRoleAuth(
  async (req) => {
    // Handler logic
    return Response.json({ message: "Success" });
  },
  {
    allowedRoles: [ROLES.ARTIST, ROLES.BAND, ROLES.MANAGER],
  }
);

// Require minimum role level
export const POST = withRoleAuth(
  async (req) => {
    // Handler logic
    return Response.json({ message: "Created" });
  },
  {
    minRole: ROLES.MANAGER,
  }
);
```

### Rate Limiting

```typescript
import { withRateLimit } from "@/lib/rate-limit";
import { getServerUser } from "@/lib/auth-server";

export async function GET(req: Request) {
  const user = await getServerUser();
  
  return withRateLimit(
    async () => {
      // API logic here
      return Response.json({ data: [] });
    },
    user?.id || "anonymous",
    user?.role as UserRole
  );
}
```

## Role Management Utilities

### Role Utils (`/src/lib/role-utils.ts`)

```typescript
import { 
  getRoleLevel,
  isRoleHigherOrEqual,
  isVerified,
  isContentCreator,
  isAdministrator,
  getAssignableRoles,
  canTransitionRole,
  getRoleDescription,
  getRoleLimits,
  formatApiClass,
  getRoleBadgeStyle
} from "@/lib/role-utils";

// Get role level (0-10)
const level = getRoleLevel("manager"); // 8

// Compare roles
const canModify = isRoleHigherOrEqual("admin", "manager"); // true

// Check role category
const isCreator = isContentCreator("artist"); // true
const isAdmin = isAdministrator("admin"); // true

// Get assignable roles
const assignable = getAssignableRoles("admin"); // ["member", "artist", "band", ...]

// Validate role transition
const result = canTransitionRole("member", "artist", "admin");
// { allowed: true }

// Get role info
const description = getRoleDescription("artist");
const limits = getRoleLimits("artist");
const apiClass = formatApiClass("5");
const badgeStyle = getRoleBadgeStyle("artist");
```

## Database Schema

```typescript
// User table includes:
{
  role: text("role", { 
    enum: ["guest", "new", "member", "artist", "band", "studio", "label", "editor", "manager", "admin", "sadmin"] 
  })
    .$defaultFn(() => "new")
    .notNull(),
  apiClass: text("api_class", { enum: ["5", "10", "20", "50"] })
    .$defaultFn(() => "5")
    .notNull(),
}
```

## Role Assignment Rules

1. **Self-Service**: Users start as `new` upon registration
2. **Email Verification**: Must verify email to upgrade from `new` to `member`
3. **Admin Assignment**: Only admins can assign roles above `member`
4. **Hierarchy Rule**: Users can only assign roles lower than their own
5. **Super Admin Protection**: Only `sadmin` can modify another `sadmin`
6. **Manager Limitation**: Managers can approve content but cannot create/modify user accounts

## Best Practices

1. **Always use role constants** from `@/db/schema` instead of strings
2. **Check permissions, not roles** when possible (e.g., `canPerformAction("canUpload")`)
3. **Use minimum role checks** for hierarchical permissions (e.g., `hasMinRole(ROLES.MANAGER)`)
4. **Rate limit all API routes** based on user role and API class
5. **Validate role transitions** before updating user roles
6. **Log role changes** for audit trail
7. **Display role badges** for visual identification

## Security Considerations

- Guest and new users have read-only access
- Email verification required to access upload/edit features
- Rate limiting prevents API abuse
- Role hierarchy prevents privilege escalation
- Super admin actions should be logged and monitored
- Regular audit of role assignments recommended

## Migration Notes

To add the `apiClass` column to existing databases:

```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS api_class text DEFAULT '5';
```

Default API class is set to "5" for all existing users.

---

For more information, see:
- [Blueprint Documentation](./BLUE PRINT.md)
- [Auth Server Utilities](/src/lib/auth-server.ts)
- [Auth Context](/src/contexts/auth-context.tsx)
- [Role Middleware](/src/lib/role-middleware.ts)
- [Role Utils](/src/lib/role-utils.ts)
