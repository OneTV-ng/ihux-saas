# Quick Upload Page Test - 5 Minutes

## 🚀 Start Dev Server
```bash
npm run dev
```
Wait for: `● Ready in 2.3s`

## 🌐 Navigate to Upload Page
```
http://localhost:3000/desk/artist/upload/single
```

## ⏳ Test #1: Loading Spinner (2-3 seconds)
✓ Green spinning loader appears immediately
✓ Title: "Preparing Upload"
✓ Message: "Checking your account requirements..."
✓ Spinner fades away after checks complete

**Expected Result**: Form appears after loading completes

## 📤 Test #2: Upload Cover Art
1. Prepare test file: `MySongTitle.jpg` (any JPG image)
2. Drag & drop or click to select
3. Watch progress bar (0-100%)
4. Check Song Title field: Should auto-populate as "MySongTitle"

**Expected Result**:
- ✓ Progress bar shows upload
- ✓ Song Title auto-filled from filename
- ✓ Success message shows

## 🎵 Test #3: Upload Audio File
1. Prepare test file: `MySongTitle.mp3` (any MP3, < 10MB)
2. Drag & drop or click to select
3. Watch progress bar (0-100%)
4. Watch for preview player to appear

**Expected Result**:
- ✓ Progress bar shows upload
- ✓ "Media Preview" section appears
- ✓ Album cover visible
- ✓ Player controls visible (play, pause, progress bar)

## ▶️ Test #4: Play Audio
1. Find "Media Preview" section below uploads
2. Click **Play** button (green button with ▶️)
3. Listen for audio to play from browser
4. Watch progress bar advance as song plays

**Expected Result**:
- ✓ Play button changes to pause (⏸️)
- ✓ Progress bar shows current time
- ✓ Audio plays from preview
- ✓ Duration displays (e.g., "0:00 / 3:45")

## 📝 Test #5: Form Auto-Fill
Look at form fields below the preview:

**Auto-filled fields** (should have values):
- ✓ Song Title (from cover filename)
- ✓ Artist (from selected artist)
- ✓ Producer (if artist has profile)
- ✓ Songwriter (if artist has profile)
- ✓ Genre (if artist has profile)
- ✓ Record Label (if artist has profile)
- ✓ Country (if artist has profile)
- ✓ Language (defaults to English)

**Test**: Try editing a field to ensure it's not locked

## ✅ Test #6: Submit Form
1. Scroll to bottom of form
2. Check two agreement boxes:
   - [ ] "I confirm that I own or have legal rights..."
   - [ ] "I agree to the Terms of Service..."
3. Click **Submit Song** button

**Expected Result**:
- ✓ Success message: "Song uploaded successfully!"
- ✓ Auto-redirect to uploads list after 2 seconds
- ✓ No errors in browser console

## 🎨 Test #7: Dark Mode (Optional)
1. Toggle dark mode (if theme toggle exists)
2. Check page appearance in dark mode
3. Verify all elements visible and readable

**Expected Result**:
- ✓ All text readable
- ✓ Colors properly contrasted
- ✓ Player visible in dark mode

## 📱 Test #8: Mobile View (Optional)
1. Open DevTools (F12)
2. Click device toggle (mobile icon)
3. Test mobile layout

**Expected Result**:
- ✓ Single column layout
- ✓ Upload zones stack vertically
- ✓ Form fields readable
- ✓ Player controls accessible
- ✓ No horizontal scroll needed

## 🐛 Troubleshooting

### Loading spinner doesn't appear
- Check: Server is running (`npm run dev`)
- Check: Page fully loads
- Check: Not cached version

### Files don't extract to Song Title
- Check: File name is correct (e.g., "My Song.jpg")
- Check: Browser console for errors
- Check: Manual entry works as fallback

### Preview doesn't show player
- Check: Both cover and audio uploaded
- Check: No browser console errors
- Check: Player context loaded

### Submit button disabled
- Check: All required fields filled:
  - Song Title ✓
  - Artist ✓
  - Producer ✓
  - Songwriter ✓
  - Country ✓
  - Language ✓
  - Cover uploaded ✓
  - Audio uploaded ✓
  - Both checkboxes checked ✓

### Audio won't play from preview
- Check: Audio file valid MP3
- Check: File size < 10MB
- Check: Browser supports HTML5 audio
- Check: No network errors

## ✨ Success Checklist

After testing, check all boxes:

- [ ] Loading spinner appears and disappears (2-3 seconds)
- [ ] Cover uploads successfully
- [ ] Song Title auto-fills from filename
- [ ] Audio uploads successfully
- [ ] Media preview appears with album cover
- [ ] Player controls visible (play, pause, progress)
- [ ] Play button works, audio plays
- [ ] Form fields pre-filled from profile defaults
- [ ] Form fields can be edited manually
- [ ] Submit button works when all fields complete
- [ ] Success message appears on submit
- [ ] Auto-redirect to uploads list works
- [ ] No errors in browser console
- [ ] Responsive design works on mobile

## 📊 Result

| Test | Status | Notes |
|------|--------|-------|
| Loading Spinner | ✓/✗ | 2-3 second delay OK |
| Cover Upload | ✓/✗ | File name auto-fill key |
| Audio Upload | ✓/✗ | Progress tracking |
| Player Display | ✓/✗ | Full controls visible |
| Play Audio | ✓/✗ | Actual playback test |
| Form Auto-Fill | ✓/✗ | Profile defaults |
| Submit | ✓/✗ | Success redirect |
| Mobile View | ✓/✗ | Optional but recommended |

## 🎯 Expected Behavior

**Fast Path** (Happy Case):
1. Page loads (2-3 sec loading spinner)
2. Upload cover → auto-fills title
3. Upload audio → shows player
4. Check form fields → mostly filled
5. Click submit → success message
6. Redirect to uploads page

**Time**: ~2 minutes total

## 🚀 Done!

If all tests pass: **Upload page is working perfectly!** ✅

If issues found: Check browser console (F12) for error messages
