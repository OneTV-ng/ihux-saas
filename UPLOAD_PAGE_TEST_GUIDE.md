# Upload Page Testing Guide

## 🚀 Quick Start

Access the upload page at: **http://localhost:3000/desk/artist/upload/single**

## 📋 Test Checklist

### Phase 1: Loading State ✅
- [ ] Page shows "Preparing Upload" spinner while checking requirements
- [ ] Spinner is green and animated
- [ ] Message: "Checking your account requirements..."
- [ ] Loading screen disappears after ~2-3 seconds

### Phase 2: Authentication & Verification
- [ ] If not logged in: Redirected to login page
- [ ] If logged in: Form loads successfully
- [ ] If email not verified: Red banner shows "Email not verified"
- [ ] If email verified: Banner shows "Uploading as [Artist Name]"

### Phase 3: File Upload Testing

#### Cover Art Upload
- [ ] Drag & drop cover image to left dropzone
- [ ] Click to select cover image
- [ ] Progress bar shows upload status (0-100%)
- [ ] Success message shows image dimensions
- [ ] File name extracts to "Song Title" field automatically
- [ ] Cover preview appears in preview section

**Test Files**:
- Image: JPG/PNG (3000x3000 or larger)
- Expected: "My Song Title.jpg" → "My Song Title" in form

#### Audio Upload
- [ ] Drag & drop MP3 to right dropzone
- [ ] Click to select MP3 file
- [ ] Progress bar shows upload status (0-100%)
- [ ] Success message shows "Ready to publish"
- [ ] File size displayed (e.g., "2.45 MB")
- [ ] Audio preview appears in preview section

**Test Files**:
- Audio: MP3 format, < 10MB
- Expected: Shows file size and duration in preview

### Phase 4: Media Preview

#### Preview with Player (Both Files Uploaded)
- [ ] Album cover displays as background image
- [ ] Song title appears on preview
- [ ] Artist name appears on preview
- [ ] Player overlay shows at bottom with:
  - [ ] Play/Pause button (green, clickable)
  - [ ] Previous/Next buttons
  - [ ] Progress bar with time tracking
  - [ ] Current time / Total duration display
  - [ ] Volume control button

#### Preview Image Only (Cover Uploaded, No Audio)
- [ ] Cover displays with title overlay
- [ ] "Cover art not uploaded" message appears
- [ ] Prompts to upload audio for full preview

#### Placeholder (Audio Only)
- [ ] Music icon displays
- [ ] Message: "Cover art not uploaded"
- [ ] Prompts to upload cover for preview with player

### Phase 5: Form Auto-Fill Testing

#### File Name Extraction
- [ ] Upload "My New Song.jpg" → Song Title = "My New Song"
- [ ] Extensions removed automatically (.jpg, .mp3, etc.)
- [ ] Multiple dots handled correctly (e.g., "Song v2.1.jpg" → "Song v2.1")
- [ ] Can manually edit after extraction

#### Profile Defaults (if artist has profile)
Expected fields auto-filled from cascading source:
- [ ] Producer (from Artist Profile → Artist → User Profile → User)
- [ ] Songwriter (from Artist Profile → Artist → User Profile → User)
- [ ] Studio (from Artist Profile → Artist → User Profile → User)
- [ ] Genre (from Artist Profile → Artist → User Profile → User)
- [ ] Sub-genre (from Artist Profile → Artist → User Profile → User)
- [ ] Record Label (from Artist Profile → Artist → User Profile → User)
- [ ] Country (from Artist Profile → Artist → User Profile → User)
- [ ] City (from Artist Profile → Artist → User Profile → User)
- [ ] Language (defaults to "English")

**Test Steps**:
1. Log in with account that has artist profile
2. Navigate to upload page
3. Check if fields auto-populate
4. Manual override should work for any field

### Phase 6: Form Submission

#### Required Fields Validation
Before submission, ensure:
- [ ] Song Title (from form or file extraction)
- [ ] Artist Name (from selected artist or user)
- [ ] Producer (from defaults or manual entry)
- [ ] Songwriter (from defaults or manual entry)
- [ ] Country (from defaults or manual entry)
- [ ] Language (defaults to English)
- [ ] Cover uploaded (with valid dimensions)
- [ ] Audio uploaded (MP3, < 10MB)
- [ ] Both checkboxes checked:
  - [ ] "I own or have legal rights..."
  - [ ] "I agree to Terms of Service..."

#### Submit Button
- [ ] Submit button disabled until all required fields filled
- [ ] Submit button enabled when ready
- [ ] Shows "Submit Song" text
- [ ] Clicking submits form data

### Phase 7: Success/Error Handling

#### Success Flow
- [ ] "Song uploaded successfully!" message appears
- [ ] Redirects to /desk/artist?tab=uploads after 2 seconds
- [ ] Song appears in uploads list

#### Error Handling
- [ ] Network errors show appropriate messages
- [ ] Invalid file types show errors
- [ ] File too large (>10MB) shows error
- [ ] Can retry after error

## 🎮 Player Controls Test

### Play/Pause
- [ ] Click play button → audio plays
- [ ] Click pause button → audio stops
- [ ] Keyboard space bar works (if implemented)

### Progress Bar
- [ ] Dragging progress bar seeks to position
- [ ] Time updates as audio plays
- [ ] Duration displays correctly (mm:ss format)

### Previous/Next
- [ ] Previous button (if queue available)
- [ ] Next button (if queue available)
- [ ] Buttons disabled if no queue

### Volume
- [ ] Volume control button visible
- [ ] Click to adjust volume
- [ ] Mute/unmute functionality (if implemented)

## 📱 Responsive Design

### Desktop (1200px+)
- [ ] Two-column layout for upload zones
- [ ] Preview takes up full width below
- [ ] All buttons and controls properly sized

### Tablet (768px-1200px)
- [ ] Grid adjusts to available space
- [ ] Preview responsive
- [ ] Touch-friendly button sizes

### Mobile (< 768px)
- [ ] Single column layout
- [ ] Upload zones stack vertically
- [ ] Preview full width
- [ ] Player controls fit on screen
- [ ] No horizontal scroll needed

## 🌓 Dark Mode

- [ ] Page displays correctly in light mode
- [ ] Page displays correctly in dark mode
- [ ] Toggle between modes works
- [ ] Colors contrast properly
- [ ] Text readable in both modes

## 🔗 Integration Points

### API Calls
1. **GET /api/profile**
   - Fetches verification status
   - Expected: { success: true, data: { verificationStatus: "verified" } }

2. **GET /api/artist?selected=true**
   - Fetches selected artist
   - Expected: { success: true, data: { id, displayName, profile, uploadSetting } }

3. **GET /api/profile/defaults?userId=xxx&artistId=yyy**
   - Fetches cascading profile defaults
   - Expected: { success: true, defaults: { producer, songwriter, ... } }

4. **POST /api/upload**
   - Uploads cover or audio file
   - Expected: { url, imageDetails, size, filename, ... }

5. **POST /api/song-upload**
   - Submits song with all metadata
   - Expected: { success: true, data: { songId, ... } }

6. **POST /api/artist/upload-setting**
   - Saves upload defaults for future use
   - Expected: { success: true }

## 🧪 Edge Cases

### File Handling
- [ ] Very large file names (>100 chars) handled gracefully
- [ ] Special characters in file name handled (é, ñ, etc.)
- [ ] Numbers in file name (e.g., "Song 01.mp3") work correctly
- [ ] Files with multiple extensions (e.g., "song.tar.gz") handled
- [ ] Spaces in file names preserved/removed correctly

### Form States
- [ ] User can edit any field after auto-fill
- [ ] Clearing a field works
- [ ] Submitting with empty optional fields works
- [ ] Form remembers state while editing
- [ ] Can cancel and start over

### Network
- [ ] Slow network: Progress bar works smoothly
- [ ] Connection drop during upload: Error shows
- [ ] Retry after error works
- [ ] Long server response: Loading state shows

## 📊 Performance

- [ ] Page loads in < 3 seconds
- [ ] File upload progress smooth (no stuttering)
- [ ] Player starts playing within 1-2 seconds
- [ ] Form interactions responsive (no lag)
- [ ] No console errors

## 🐛 Common Issues to Check

1. **Loading spinner doesn't appear**
   - Check: isLoading state updates correctly
   - Check: LoadingPage component renders
   - Check: Spinner animation CSS loads

2. **File name extraction not working**
   - Check: getFileNameWithoutExtension function
   - Check: songTitle state updates on upload
   - Check: File input handler triggers correctly

3. **Profile defaults not appearing**
   - Check: useProfileDefaults hook loads
   - Check: API endpoint responds correctly
   - Check: profileDefaults state has data
   - Check: useEffect applies defaults

4. **Player not showing**
   - Check: Both coverUrl and mp3Url set
   - Check: UploadPreview component renders
   - Check: Audio element initializes
   - Check: No console errors

5. **Form submission fails**
   - Check: All required fields filled
   - Check: Both checkboxes checked
   - Check: API endpoint working
   - Check: Request body formatted correctly

## 📝 Manual Testing Scenarios

### Scenario 1: New User Upload
1. Create new account → verify email
2. Create artist profile → set defaults
3. Navigate to upload page
4. Upload cover (file name: "My First Song.jpg")
5. Upload audio (file name: "My First Song.mp3")
6. Check auto-fills work
7. Check profile defaults applied
8. Submit song
9. Verify success message and redirect

### Scenario 2: Quick Re-upload
1. Log in with existing artist account
2. Navigate to upload page
3. Notice defaults pre-filled from previous upload
4. Change only song title and cover
5. Keep audio from previous
6. Submit
7. Verify song created

### Scenario 3: Incomplete Upload
1. Upload only cover art
2. See preview image without player
3. Upload audio
4. See full player with all controls
5. Play audio from preview
6. Complete form and submit

## ✅ Sign-Off

Once all tests pass, mark page as ready for production:

- [ ] All loading states working
- [ ] File uploads functional
- [ ] Preview components displaying
- [ ] Player controls working
- [ ] Form auto-fills working
- [ ] Profile defaults applying
- [ ] Submission successful
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Dark mode verified

**Status**: Ready for testing ✅
