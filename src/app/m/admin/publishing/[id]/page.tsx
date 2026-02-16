'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  Copy,
  Edit3,
  Save,
  X,
  AlertCircle,
  Loader,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mobileApi } from '@/lib/mobile-api-client';
import { useAlert } from '@/contexts/alert-context';

interface Song {
  id: string;
  title: string;
  artistName: string;
  genre: string;
  producer?: string;
  writer?: string;
  recordLabel?: string;
  upc?: string;
  releaseDate?: string;
  language?: string;
  productCode?: string;
  status?: string;
  publishedBy?: string;
  publishedAt?: string;
}

interface Track {
  id: string;
  songId: string;
  title: string;
  isrc?: string;
  lyrics?: string;
  leadVocal?: string;
  featured?: string;
  producer?: string;
  writer?: string;
  duration?: number;
  explicit?: string;
}

interface PublishingRecord {
  id: string;
  songId: string;
  productCode: string;
  publishedBy: string;
  status: string;
  createdAt?: string;
}

export default function PublishingDetailsPage() {
  const params = useParams();
  const songId = params.id as string;
  const { showAlert } = useAlert();

  const [song, setSong] = useState<Song | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [publishingRecord, setPublishingRecord] = useState<PublishingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [expandedTracks, setExpandedTracks] = useState<Set<string>>(new Set());
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [updatingFieldId, setUpdatingFieldId] = useState<string | null>(null);

  useEffect(() => {
    loadPublishingDetails();
  }, [songId]);

  const loadPublishingDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await mobileApi.admin.getPublishingDetails(songId);

      if (response.success) {
        const data = response.data as any;
        setSong(data?.song);
        setTracks(data?.tracks || []);
        setPublishingRecord(data?.publishingRecord);
      } else {
        setError(response.error || 'Failed to load publishing details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load publishing details');
      console.error('Error loading publishing details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (value: string, fieldName: string) => {
    navigator.clipboard.writeText(value);
    showAlert(`${fieldName} copied to clipboard!`, 'success');
  };

  const handleUpdateSongField = async (field: string, value: any) => {
    if (!song) return;

    try {
      setUpdatingFieldId(`song-${field}`);
      const response = await mobileApi.admin.updateSongField(songId, field, value);

      if (response.success) {
        setSong((prev) => (prev ? { ...prev, [field]: value } : null));
        showAlert(`${field} updated successfully`, 'success');
        setEditMode(false);
      } else {
        showAlert(response.error || 'Failed to update song', 'error');
      }
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Failed to update song', 'error');
    } finally {
      setUpdatingFieldId(null);
    }
  };

  const handleUpdateTrackField = async (trackId: string, field: string, value: any) => {
    try {
      setUpdatingFieldId(`track-${trackId}-${field}`);
      const response = await mobileApi.admin.updateTrackField(songId, trackId, field, value);

      if (response.success) {
        setTracks((prev) =>
          prev.map((t) =>
            t.id === trackId ? { ...t, [field]: value } : t
          )
        );
        showAlert(`Track ${field} updated successfully`, 'success');
        setEditingTrackId(null);
      } else {
        showAlert(response.error || 'Failed to update track', 'error');
      }
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Failed to update track', 'error');
    } finally {
      setUpdatingFieldId(null);
    }
  };

  if (error && !song) {
    return (
      <div className="w-full p-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/m/admin/publishing">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
        <Card className="border-destructive">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadPublishingDetails}
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-4 flex justify-center">
        <Loader className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  if (!song) {
    return (
      <div className="w-full p-4">
        <Link href="/m/admin/publishing">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <p className="text-muted-foreground mt-4">Publishing details not found</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b p-4 z-10 flex items-center gap-3">
        <Link href="/m/admin/publishing">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-primary">Publishing Details</h1>
          <p className="text-xs text-muted-foreground">{song.title}</p>
        </div>
        <Button
          variant={editMode ? 'destructive' : 'default'}
          size="sm"
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? (
            <>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Product Code Card */}
        {publishingRecord && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publishing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div>
                  <p className="text-xs text-muted-foreground">Product Code</p>
                  <p className="text-lg font-mono font-bold text-blue-600">
                    {publishingRecord.productCode}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    handleCopyToClipboard(publishingRecord.productCode, 'Product Code')
                  }
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className="mt-1">{publishingRecord.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Published By</p>
                  <p className="text-sm font-medium mt-1">{publishingRecord.publishedBy}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Song Metadata Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Song Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <SongMetadataField
              label="Title"
              value={song.title}
              editable={editMode}
              onCopy={() => handleCopyToClipboard(song.title, 'Title')}
              onSave={(value) => handleUpdateSongField('title', value)}
              isUpdating={updatingFieldId === 'song-title'}
            />

            <SongMetadataField
              label="Artist"
              value={song.artistName}
              editable={editMode}
              onCopy={() => handleCopyToClipboard(song.artistName, 'Artist')}
              onSave={(value) => handleUpdateSongField('artistName', value)}
              isUpdating={updatingFieldId === 'song-artistName'}
            />

            <SongMetadataField
              label="Genre"
              value={song.genre || 'N/A'}
              editable={editMode}
              onCopy={() => handleCopyToClipboard(song.genre || 'N/A', 'Genre')}
              onSave={(value) => handleUpdateSongField('genre', value)}
              isUpdating={updatingFieldId === 'song-genre'}
            />

            <SongMetadataField
              label="Producer"
              value={song.producer || 'N/A'}
              editable={editMode}
              onCopy={() => handleCopyToClipboard(song.producer || 'N/A', 'Producer')}
              onSave={(value) => handleUpdateSongField('producer', value || null)}
              isUpdating={updatingFieldId === 'song-producer'}
            />

            <SongMetadataField
              label="Writer"
              value={song.writer || 'N/A'}
              editable={editMode}
              onCopy={() => handleCopyToClipboard(song.writer || 'N/A', 'Writer')}
              onSave={(value) => handleUpdateSongField('writer', value || null)}
              isUpdating={updatingFieldId === 'song-writer'}
            />

            <SongMetadataField
              label="Record Label"
              value={song.recordLabel || 'N/A'}
              editable={editMode}
              required={true}
              onCopy={() => handleCopyToClipboard(song.recordLabel || 'N/A', 'Record Label')}
              onSave={(value) => handleUpdateSongField('recordLabel', value)}
              isUpdating={updatingFieldId === 'song-recordLabel'}
            />

            <SongMetadataField
              label="UPC"
              value={song.upc || 'N/A'}
              editable={editMode}
              required={true}
              helpText="Admin field - Required to progress song"
              onCopy={() => handleCopyToClipboard(song.upc || 'N/A', 'UPC')}
              onSave={(value) => handleUpdateSongField('upc', value)}
              isUpdating={updatingFieldId === 'song-upc'}
            />

            <SongMetadataField
              label="Language"
              value={song.language || 'English'}
              editable={editMode}
              onCopy={() => handleCopyToClipboard(song.language || 'English', 'Language')}
              onSave={(value) => handleUpdateSongField('language', value)}
              isUpdating={updatingFieldId === 'song-language'}
            />
          </CardContent>
        </Card>

        {/* Tracks Card */}
        {tracks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tracks ({tracks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tracks.map((track) => (
                <div key={track.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedTracks);
                      if (newExpanded.has(track.id)) {
                        newExpanded.delete(track.id);
                      } else {
                        newExpanded.add(track.id);
                      }
                      setExpandedTracks(newExpanded);
                    }}
                    className="w-full p-3 flex items-center justify-between hover:bg-accent transition"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0 text-left">
                      {expandedTracks.has(track.id) ? (
                        <ChevronUp className="w-4 h-4 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{track.title}</p>
                        {track.isrc && (
                          <p className="text-xs text-muted-foreground">ISRC: {track.isrc}</p>
                        )}
                      </div>
                    </div>
                  </button>

                  {expandedTracks.has(track.id) && (
                    <div className="p-3 bg-muted/30 space-y-3 border-t">
                      <SongMetadataField
                        label="Track Title"
                        value={track.title}
                        editable={editMode && editingTrackId === track.id}
                        onCopy={() => handleCopyToClipboard(track.title, 'Track Title')}
                        onSave={(value) => handleUpdateTrackField(track.id, 'title', value)}
                        isUpdating={updatingFieldId === `track-${track.id}-title`}
                      />

                      <SongMetadataField
                        label="ISRC"
                        value={track.isrc || 'N/A'}
                        editable={editMode && editingTrackId === track.id}
                        required={true}
                        helpText="Admin field - Required to progress track"
                        onCopy={() => handleCopyToClipboard(track.isrc || 'N/A', 'ISRC')}
                        onSave={(value) => handleUpdateTrackField(track.id, 'isrc', value)}
                        isUpdating={updatingFieldId === `track-${track.id}-isrc`}
                      />

                      <SongMetadataField
                        label="Lead Vocal"
                        value={track.leadVocal || 'N/A'}
                        editable={editMode && editingTrackId === track.id}
                        onCopy={() =>
                          handleCopyToClipboard(track.leadVocal || 'N/A', 'Lead Vocal')
                        }
                        onSave={(value) =>
                          handleUpdateTrackField(track.id, 'leadVocal', value || null)
                        }
                        isUpdating={updatingFieldId === `track-${track.id}-leadVocal`}
                      />

                      <SongMetadataField
                        label="Producer"
                        value={track.producer || 'N/A'}
                        editable={editMode && editingTrackId === track.id}
                        onCopy={() => handleCopyToClipboard(track.producer || 'N/A', 'Producer')}
                        onSave={(value) =>
                          handleUpdateTrackField(track.id, 'producer', value || null)
                        }
                        isUpdating={updatingFieldId === `track-${track.id}-producer`}
                      />

                      <SongMetadataField
                        label="Duration (seconds)"
                        value={track.duration ? track.duration.toString() : 'N/A'}
                        editable={editMode && editingTrackId === track.id}
                        onCopy={() =>
                          handleCopyToClipboard(
                            track.duration ? track.duration.toString() : 'N/A',
                            'Duration'
                          )
                        }
                        onSave={(value) =>
                          handleUpdateTrackField(track.id, 'duration', parseInt(value) || 0)
                        }
                        isUpdating={updatingFieldId === `track-${track.id}-duration`}
                      />

                      {editMode && editingTrackId === track.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setEditingTrackId(null)}
                        >
                          Done Editing
                        </Button>
                      )}

                      {editMode && editingTrackId !== track.id && (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={() => setEditingTrackId(track.id)}
                        >
                          Edit Track
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable field component for displaying and editing song/track metadata
 */
interface SongMetadataFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  required?: boolean;
  helpText?: string;
  onCopy?: () => void;
  onSave?: (value: string) => void;
  isUpdating?: boolean;
}

function SongMetadataField({
  label,
  value,
  editable = false,
  required = false,
  helpText,
  onCopy,
  onSave,
  isUpdating = false,
}: SongMetadataFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    if (onSave) {
      await onSave(editValue);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent transition">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </p>
        {isEditing && editable ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full mt-1 px-2 py-1 text-sm border rounded bg-background"
            disabled={isUpdating}
          />
        ) : (
          <p className="text-sm font-medium mt-1 break-words">{value}</p>
        )}
        {helpText && <p className="text-xs text-orange-600 mt-1">{helpText}</p>}
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        {editable && !isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
          >
            <Edit3 className="w-3 h-3" />
          </Button>
        )}

        {isEditing && editable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <Loader className="w-3 h-3 animate-spin" />
            ) : (
              <Save className="w-3 h-3" />
            )}
          </Button>
        )}

        {!isEditing && onCopy && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCopy}>
            <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
