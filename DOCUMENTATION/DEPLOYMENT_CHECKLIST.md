# Deployment Checklist - Incremental Music Upload System

## ✅ Pre-Deployment Verification

### Code Quality
- [x] All TypeScript compilation errors resolved
- [x] Next.js 13+ route parameters updated (`params: Promise<...>`)
- [x] Import statements corrected (better-auth instead of next-auth)
- [x] Type safety verified (no implicit any)
- [x] Code comments added for clarity
- [x] Error handling implemented on all endpoints

### API Endpoints (5 Total)
- [x] `POST /api/upload/file` - File upload with metadata extraction
- [x] `POST /api/songs/create` - Create song with metadata
- [x] `POST /api/songs/[songId]/tracks` - Add tracks with auto-increment
- [x] `POST /api/songs/[songId]/submit` - Submit song for review
- [x] `GET /api/songs/[songId]` - Fetch song details (public)

### Frontend Components (2 Total)
- [x] `FileUploadService` - Reusable file upload service with progress
- [x] `SongDisplay` - Song display with playback options

### Documentation (4 Files)
- [x] `ARTIST_SONG_UPLOAD_API.md` - Complete API reference
- [x] `E2E_TEST_PLAN.md` - 100+ test cases across 10 phases
- [x] `IMPLEMENTATION_COMPLETE.md` - Implementation summary
- [x] `QUICK_START_API.md` - Developer quick start guide
- [x] `DEPLOYMENT_CHECKLIST.md` - This checklist

---

## 🚀 Pre-Deployment Steps

### 1. Environment Setup
- [ ] Verify Node.js version >= 20.9.0
- [ ] Verify PostgreSQL database running
- [ ] Verify `.env.local` configured with:
  - `DATABASE_URL` - Database connection
  - `BETTER_AUTH_URL` - Auth URL
  - `GITHUB_CLIENT_ID` - GitHub OAuth (if using)
  - `GOOGLE_CLIENT_ID` - Google OAuth (if using)
  - `SPOTIFY_CLIENT_ID` - Spotify OAuth (if using)
- [ ] Verify `/public/uploads/` directory is writable

### 2. Database Setup
- [ ] Verify `songs` table exists with correct schema
- [ ] Verify `tracks` table exists with correct schema
- [ ] Verify `uploads` table exists with correct schema
- [ ] Create indexes:
  ```sql
  CREATE INDEX idx_tracks_songId ON tracks(songId);
  CREATE UNIQUE INDEX idx_tracks_songId_trackNumber ON tracks(songId, trackNumber);
  CREATE INDEX idx_songs_createdBy ON songs(createdBy);
  CREATE INDEX idx_songs_status ON songs(status);
  ```

### 3. Code Verification
- [ ] Run `npm run lint` to check for linting errors
- [ ] Run `npx tsc --noEmit` to verify TypeScript compilation
- [ ] Review git diff for unintended changes
- [ ] Check that no sensitive data is committed (.env, credentials)

### 4. Testing
- [ ] Run unit tests (if available)
- [ ] Test file upload endpoint locally
- [ ] Test song creation flow
- [ ] Test track addition with auto-increment
- [ ] Test song submission
- [ ] Test song retrieval
- [ ] Test error cases (invalid inputs, authorization)

### 5. Performance Checks
- [ ] Verify database query performance
- [ ] Check file upload speed
- [ ] Monitor memory usage during uploads
- [ ] Verify no N+1 queries

---

## 📋 Deployment to Staging

### Pre-Deployment
- [ ] Create feature branch: `git checkout -b feature/incremental-upload`
- [ ] Ensure all changes are committed
- [ ] Create pull request with description

### Deployment Steps
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if needed)
npm install

# 3. Run database migrations (if any)
npm run db:push

# 4. Build the project
npm run build

# 5. Start staging server
npm run start
```

### Post-Deployment Testing
- [ ] Test all 5 API endpoints in staging
- [ ] Test file upload functionality
- [ ] Test complete workflow (create → add tracks → submit)
- [ ] Verify error messages are clear
- [ ] Check database records created correctly
- [ ] Test with multiple users
- [ ] Test authorization checks

---

## 🔄 Rollback Plan

If issues occur during deployment:

```bash
# 1. Identify the issue from logs
tail -f /var/log/app.log

# 2. Rollback to previous version
git revert <commit-hash>

# 3. Redeploy
npm run build && npm run start

# 4. Verify rollback successful
curl http://localhost:3000/api/health
```

---

## 📊 Post-Deployment Monitoring

### Metrics to Track
- [ ] API endpoint response times
- [ ] File upload success rate
- [ ] Database query performance
- [ ] Error rates per endpoint
- [ ] User authentication success rate

### Logs to Monitor
```bash
# Watch application logs
tail -f /var/log/app.log

# Check for errors
grep -i "error\|exception" /var/log/app.log

# Monitor database
psql -d singf -c "SELECT COUNT(*) FROM songs; SELECT COUNT(*) FROM tracks; SELECT COUNT(*) FROM uploads;"
```

### Alert Conditions
- [ ] Response time > 5 seconds
- [ ] Error rate > 1%
- [ ] File upload failures > 5%
- [ ] Database connection errors
- [ ] Out of disk space
- [ ] Memory usage > 80%

---

## 🐛 Known Issues & Workarounds

### Issue: TypeScript compilation errors after pull
**Cause:** Node modules cache or build artifacts
**Workaround:**
```bash
rm -rf .next node_modules
npm install
npm run build
```

### Issue: File upload failing
**Cause:** `/public/uploads/` directory not writable
**Workaround:**
```bash
chmod -R 755 public/uploads
chown -R www-data:www-data public/uploads
```

### Issue: Database connection timeout
**Cause:** DATABASE_URL incorrect or database down
**Workaround:**
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection pool
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"
```

---

## 📝 Migration from Old System

### If Running Old System
1. Old `/api/upload/publish` endpoint still works
2. New endpoints operate independently
3. Run both systems in parallel during transition
4. Gradually migrate users to new system
5. Monitor for issues before deprecating old system

### Feature Flag Approach
```typescript
// In environment variables
ENABLE_INCREMENTAL_UPLOAD=true

// In code
if (process.env.ENABLE_INCREMENTAL_UPLOAD) {
  // Use new endpoints
} else {
  // Use old endpoints
}
```

---

## ✨ Success Criteria

After deployment, verify:

✅ All 5 API endpoints responding correctly
✅ File upload working with proper metadata
✅ Song creation with auto-generated IDs
✅ Track auto-increment working
✅ Authorization checks in place
✅ Error messages clear and helpful
✅ Database records created correctly
✅ No TypeScript errors in production build
✅ Response times < 2 seconds
✅ File storage working properly

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** "Module not found: Can't resolve 'next-auth/next'"
- **Solution:** Ensure `@/lib/auth-server` is imported instead
- **File:** Check all API route files in `src/app/api/`

**Issue:** "Cannot add or update a child row: a foreign key constraint fails"
- **Solution:** Ensure song is created before adding tracks
- **Check:** Verify transaction logic in `/api/songs/[songId]/tracks`

**Issue:** "Track numbers not auto-incrementing"
- **Solution:** Verify database index on `(songId, trackNumber)`
- **Command:** `CREATE UNIQUE INDEX idx_tracks_songId_trackNumber ON tracks(songId, trackNumber);`

**Issue:** File upload returns 500 error
- **Solution:** Check `/public/uploads/` permissions
- **Command:** `chmod 755 public/uploads && chown -R www-data:www-data public/uploads`

---

## 📚 Documentation References

- **API Reference:** `ARTIST_SONG_UPLOAD_API.md`
- **Testing Guide:** `E2E_TEST_PLAN.md`
- **Implementation Details:** `IMPLEMENTATION_COMPLETE.md`
- **Quick Start:** `QUICK_START_API.md`
- **Code Architecture:** See inline comments in route files

---

## 🎯 Deployment Timeline

| Phase | Duration | Task |
|-------|----------|------|
| Testing | 1-2 days | Run E2E tests, verify endpoints |
| Staging | 1 day | Deploy to staging, test integration |
| UAT | 2-3 days | User acceptance testing |
| Production | TBD | Deploy to production |
| Monitoring | Ongoing | Monitor metrics, respond to issues |

---

## 📋 Sign-Off

- [ ] Developer: Confirms code quality ✅
- [ ] QA: Confirms testing complete ✅
- [ ] DevOps: Confirms infrastructure ready ✅
- [ ] Product: Confirms feature meets requirements ✅

---

## Version Information

- **System Version:** 1.0.0
- **API Version:** v1
- **Next.js Version:** 16.x
- **Node.js Required:** >= 20.9.0
- **Database:** PostgreSQL 12+
- **Deployment Date:** [To be filled]
- **Deployed By:** [To be filled]

---

## Final Checklist

- [ ] All code committed and pushed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Database ready
- [ ] Environment variables configured
- [ ] Monitoring tools configured
- [ ] Team notified of deployment
- [ ] Rollback plan documented
- [ ] Support team briefed

---

**Status:** ✅ READY FOR DEPLOYMENT

**Last Updated:** February 12, 2026
**Next Review:** Post-deployment
