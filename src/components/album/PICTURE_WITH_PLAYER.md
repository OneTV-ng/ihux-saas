# Picture with Player Component

A flexible album/song cover component with an integrated MP3 player overlay.

## Overview

The `PictureWithPlayer` component displays an album cover image with an optional interactive MP3 player overlay. It's perfect for showcasing songs, albums, or playlists with playback controls.

## Features

✅ Background image display with zoom on hover
✅ Integrated MP3 player controls
✅ Progress bar with time display
✅ Play/Pause/Previous/Next controls
✅ Multiple size options (small, medium, large)
✅ Hover effects and smooth animations
✅ Mobile-optimized version
✅ Compact version for lists/sidebars
✅ Dark theme with gradient overlay

## Components

### 1. PictureWithPlayer (Main)

Full-featured component with all player controls.

```typescript
import { PictureWithPlayer } from "@/components/album/picture-with-player";

<PictureWithPlayer
  imageUrl="https://..."
  title="Song Title"
  artist="Artist Name"
  audioUrl="https://..."
  isPlaying={false}
  currentTime={0}
  duration={180}
  onPlay={() => console.log("Play")}
  onPause={() => console.log("Pause")}
  onPrevious={() => console.log("Previous")}
  onNext={() => console.log("Next")}
  showPlayer={true}
  size="medium"
/>
```

### 2. PictureWithPlayerMobile

Optimized for mobile devices - full screen size with player.

```typescript
import { PictureWithPlayerMobile } from "@/components/album/picture-with-player";

<PictureWithPlayerMobile
  imageUrl="https://..."
  title="Song Title"
  artist="Artist Name"
  audioUrl="https://..."
  isPlaying={isPlaying}
  currentTime={currentTime}
  duration={duration}
  onPlay={handlePlay}
  onPause={handlePause}
/>
```

### 3. PictureWithPlayerCompact

Compact version for lists and sidebars - minimal controls.

```typescript
import { PictureWithPlayerCompact } from "@/components/album/picture-with-player";

<PictureWithPlayerCompact
  imageUrl="https://..."
  title="Song Title"
  artist="Artist Name"
  audioUrl="https://..."
  isPlaying={isPlaying}
  onPlay={handlePlay}
  onPause={handlePause}
  onClick={() => navigate("/song/details")}
/>
```

## API

### Props

```typescript
interface PictureWithPlayerProps {
  // Required
  imageUrl: string;        // Album/cover image URL
  title: string;           // Song/album title
  artist: string;          // Artist name

  // Audio
  audioUrl?: string;       // MP3 file URL

  // Playback Callbacks
  onPlay?: () => void;
  onPause?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;

  // Playback State
  isPlaying?: boolean;
  currentTime?: number;    // In seconds
  duration?: number;       // In seconds

  // Display Options
  showPlayer?: boolean;    // Show overlay player
  size?: "small" | "medium" | "large";

  // Interaction
  onClick?: () => void;

  // Styling
  className?: string;
}
```

## Sizes

### Small (w-32 h-32)
- Best for: Sidebars, song lists, track listings
- Player height: 20 (5rem)
- Use case: Compact display

### Medium (w-64 h-64)
- Best for: Album pages, featured sections
- Player height: 24 (6rem)
- Use case: Main content area

### Large (w-full aspect-square)
- Best for: Full-screen player, hero section
- Player height: 32 (8rem)
- Use case: Mobile view, dedicated player

## Usage Examples

### Example 1: Album Page Display

```typescript
import { PictureWithPlayer } from "@/components/album/picture-with-player";
import { usePlayer } from "@/contexts/player-context";

export function AlbumPlayer() {
  const { current, isPlaying, play, pause } = usePlayer();

  if (!current) return null;

  return (
    <div className="max-w-md mx-auto">
      <PictureWithPlayer
        imageUrl={current.cover}
        title={current.title}
        artist={current.artist}
        audioUrl={current.mp3}
        isPlaying={isPlaying}
        onPlay={() => play(current)}
        onPause={pause}
        size="medium"
        showPlayer={true}
      />
    </div>
  );
}
```

### Example 2: Song List with Hover Player

```typescript
export function SongList() {
  const [selected, setSelected] = useState<Song | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {songs.map((song) => (
        <PictureWithPlayerCompact
          key={song.id}
          imageUrl={song.cover}
          title={song.title}
          artist={song.artist}
          audioUrl={song.audioUrl}
          isPlaying={selected?.id === song.id}
          onPlay={() => playSong(song)}
          onPause={() => setSelected(null)}
          onClick={() => navigate(`/song/${song.id}`)}
        />
      ))}
    </div>
  );
}
```

### Example 3: Mobile Player

```typescript
export function MobileNowPlaying() {
  const { current, isPlaying, play, pause, next, previous } = usePlayer();

  return (
    <div className="flex-1">
      <PictureWithPlayerMobile
        imageUrl={current?.cover || ""}
        title={current?.title || ""}
        artist={current?.artist || ""}
        audioUrl={current?.mp3 || ""}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={current?.duration || 0}
        onPlay={() => play()}
        onPause={pause}
        onNext={next}
        onPrevious={previous}
      />
    </div>
  );
}
```

### Example 4: With Context Player Integration

```typescript
export function SongCard({ song }: { song: Song }) {
  const { play, pause, current, isPlaying } = usePlayer();

  const handlePlay = () => {
    play({ mp3: song.audioUrl, cover: song.cover, title: song.title, artist: song.artist });
  };

  return (
    <PictureWithPlayer
      imageUrl={song.cover}
      title={song.title}
      artist={song.artist}
      audioUrl={song.audioUrl}
      isPlaying={isPlaying && current?.mp3 === song.audioUrl}
      currentTime={current?.mp3 === song.audioUrl ? currentTime : 0}
      duration={song.duration}
      onPlay={handlePlay}
      onPause={pause}
      size="medium"
      showPlayer={true}
    />
  );
}
```

## Styling

### Customization

The component uses Tailwind CSS with the following configurable classes:

```typescript
// Size customization
<PictureWithPlayer
  size="large"
  className="rounded-lg shadow-xl"
/>

// Player position customization
// Control via size prop and custom CSS
```

### Dark Mode

The component automatically adapts to dark mode through Tailwind's dark mode support:

- Light mode: Light overlay with white text
- Dark mode: Dark overlay with adjusted opacity

## Player Controls

### Controls Available

1. **Play/Pause** - Toggle playback
2. **Previous** - Go to previous track
3. **Next** - Go to next track
4. **Volume** - Volume control (placeholder)
5. **Progress Bar** - Seek position in track

### Time Display

- Shows current time and total duration
- Format: `M:SS` (e.g., `2:30`)
- Updates in real-time

### Progress Bar

- Visual indicator of playback position
- Green progress indicator
- Interactive seek support (when implemented)

## Responsive Behavior

### Mobile

- Uses full viewport width
- Large size for better touch targets
- Optimized touch controls

### Tablet

- Medium to large sizes
- Landscape orientation support
- Flexible layout

### Desktop

- All sizes available
- Hover effects enabled
- Compact sidebars available

## Animation Effects

1. **Image Zoom** - On hover (scale 1.05)
2. **Overlay Fade** - Smooth transitions
3. **Button Hover** - Color and background changes
4. **Progress Animation** - Smooth playback progress

## Accessibility

- Semantic button elements
- ARIA labels for all controls
- Keyboard accessible (future enhancement)
- Screen reader friendly

## Integration with Player Context

```typescript
// Using with usePlayer hook
const { current, isPlaying, play, pause, next, prev } = usePlayer();

<PictureWithPlayer
  imageUrl={current?.cover}
  title={current?.title}
  artist={current?.artist}
  audioUrl={current?.mp3}
  isPlaying={isPlaying}
  onPlay={() => play()}
  onPause={pause}
  onNext={next}
  onPrevious={prev}
/>
```

## Performance

- Image lazy loading supported
- Efficient state management
- Smooth 60fps animations
- Minimal re-renders with React optimization

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Image Not Loading
- Check image URL is valid
- Verify CORS headers if external
- Use CDN for better performance

### Player Not Showing
- Ensure `showPlayer={true}`
- Check `audioUrl` is provided
- Verify audio format is supported

### Controls Not Working
- Check callback functions are provided
- Verify player context is available
- Check browser console for errors

## Examples in Action

### Minimal Setup
```typescript
<PictureWithPlayer
  imageUrl="/cover.jpg"
  title="My Song"
  artist="My Artist"
  audioUrl="/audio.mp3"
/>
```

### Full Featured
```typescript
<PictureWithPlayer
  imageUrl="/cover.jpg"
  title="My Song"
  artist="My Artist"
  audioUrl="/audio.mp3"
  isPlaying={isPlaying}
  currentTime={currentTime}
  duration={180}
  onPlay={handlePlay}
  onPause={handlePause}
  onNext={handleNext}
  onPrevious={handlePrevious}
  showPlayer={true}
  size="medium"
  className="shadow-2xl"
/>
```

## Related Components

- `AlbumPreview` - Album grid display
- `TrackList` - Song list view
- `Player` - Standalone player component

## Future Enhancements

- Keyboard shortcuts support
- Volume control implementation
- Seek bar interaction
- Playlist shuffle/repeat modes
- Favorite/like button
- Share functionality
- Lyrics display
