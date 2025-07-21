import React, { useState, useEffect } from 'react';
import { Card, GlassCard } from './ui/Card';
import Button from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { HeartIcon, ShareIcon, BookmarkIcon, UserPlusIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const SocialFeatures = ({ recording, onUpdate }) => {
  const { user, isAuthenticated } = useAuth();
  const [socialData, setSocialData] = useState({
    liked: false,
    bookmarked: false,
    following: false,
    likes: recording?.likes || 0,
    bookmarks: recording?.bookmarks || 0,
    shares: recording?.shares || 0
  });
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recording && isAuthenticated) {
      fetchSocialData();
      fetchUserPlaylists();
    }
  }, [recording, isAuthenticated]);

  const fetchSocialData = async () => {
    try {
      const response = await fetch(`/api/recordings/${recording.id}/social`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSocialData(data);
    } catch (error) {
      console.error('Error fetching social data:', error);
    }
  };

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch('/api/playlists/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setPlaylists(data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/recordings/${recording.id}/like`, {
        method: socialData.liked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSocialData(prev => ({
          ...prev,
          liked: !prev.liked,
          likes: prev.liked ? prev.likes - 1 : prev.likes + 1
        }));
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/recordings/${recording.id}/bookmark`, {
        method: socialData.bookmarked ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSocialData(prev => ({
          ...prev,
          bookmarked: !prev.bookmarked,
          bookmarks: prev.bookmarked ? prev.bookmarks - 1 : prev.bookmarks + 1
        }));
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated || !recording.creator) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${recording.creator.id}/follow`, {
        method: socialData.following ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSocialData(prev => ({
          ...prev,
          following: !prev.following
        }));
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform) => {
    const url = `${window.location.origin}/recording/${recording.id}`;
    const title = `Check out "${recording.title}" on San2Stic`;
    const text = recording.description || '';

    try {
      switch (platform) {
        case 'copy':
          await navigator.clipboard.writeText(url);
          alert('Link copied to clipboard!');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`);
          break;
        case 'email':
          window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`);
          break;
        default:
          break;
      }

      // Update share count
      await fetch(`/api/recordings/${recording.id}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform })
      });

      setSocialData(prev => ({
        ...prev,
        shares: prev.shares + 1
      }));
      onUpdate?.();
    } catch (error) {
      console.error('Error sharing:', error);
    }
    setShowShareMenu(false);
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`/api/playlists/${playlistId}/recordings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ recordingId: recording.id })
      });

      if (response.ok) {
        alert('Added to playlist!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add to playlist');
      }
    } catch (error) {
      console.error('Error adding to playlist:', error);
      alert('Failed to add to playlist');
    }
    setShowPlaylistMenu(false);
  };

  const handleCreatePlaylist = async () => {
    const name = prompt('Enter playlist name:');
    if (!name) return;

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name, 
          description: `Playlist created for ${recording.title}`,
          recordings: [recording.id]
        })
      });

      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylists(prev => [...prev, newPlaylist]);
        alert('Playlist created and recording added!');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    }
    setShowPlaylistMenu(false);
  };

  if (!recording) return null;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {/* Like Button */}
      <div className="flex items-center gap-1">
        <Button
          onClick={handleLike}
          disabled={!isAuthenticated || loading}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:text-red-500"
        >
          {socialData.liked ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span className="text-sm">{socialData.likes}</span>
        </Button>
      </div>

      {/* Bookmark Button */}
      <div className="flex items-center gap-1">
        <Button
          onClick={handleBookmark}
          disabled={!isAuthenticated || loading}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:text-blue-500"
        >
          {socialData.bookmarked ? (
            <BookmarkSolidIcon className="w-5 h-5 text-blue-500" />
          ) : (
            <BookmarkIcon className="w-5 h-5" />
          )}
          <span className="text-sm">{socialData.bookmarks}</span>
        </Button>
      </div>

      {/* Share Button */}
      <div className="relative">
        <Button
          onClick={() => setShowShareMenu(!showShareMenu)}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:text-green-500"
        >
          <ShareIcon className="w-5 h-5" />
          <span className="text-sm">{socialData.shares}</span>
        </Button>

        {showShareMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48">
            <div className="p-2">
              <button
                onClick={() => handleShare('copy')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                Copy Link
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                Share on Twitter
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                Share on Facebook
              </button>
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                Share on WhatsApp
              </button>
              <button
                onClick={() => handleShare('email')}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                Share via Email
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add to Playlist Button */}
      <div className="relative">
        <Button
          onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
          disabled={!isAuthenticated}
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 hover:text-purple-500"
        >
          <ListBulletIcon className="w-5 h-5" />
          <span className="text-sm hidden sm:inline">Playlist</span>
        </Button>

        {showPlaylistMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 min-w-48 max-h-64 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={handleCreatePlaylist}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded font-medium text-blue-600 dark:text-blue-400"
              >
                + Create New Playlist
              </button>
              <div className="border-t border-gray-200 dark:border-gray-600 my-2"></div>
              {playlists.length > 0 ? (
                playlists.map(playlist => (
                  <button
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {playlist.name}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No playlists yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Follow Creator Button */}
      {recording.creator && recording.creator.id !== user?.id && (
        <Button
          onClick={handleFollow}
          disabled={!isAuthenticated || loading}
          variant={socialData.following ? "solid" : "outline"}
          size="sm"
          className="flex items-center gap-1 ml-auto"
        >
          <UserPlusIcon className="w-4 h-4" />
          <span className="text-sm">
            {socialData.following ? 'Following' : 'Follow'}
          </span>
        </Button>
      )}
    </div>
  );
};

export default SocialFeatures;