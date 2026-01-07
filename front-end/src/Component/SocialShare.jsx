import React from 'react';
import { Facebook, Twitter, Linkedin, Mail, Share2, Copy, Check } from 'lucide-react';
import { useErrorToast } from './ErrorToast';

/**
 * Social Share Component - Safe implementation for sharing content
 */
const SocialShare = ({ 
  url = '', 
  title = 'Check out this on TripLink', 
  description = '',
  className = '' 
}) => {
  const { showToast } = useErrorToast();
  const [copied, setCopied] = React.useState(false);
  
  const shareUrl = url || window.location.href;
  const shareText = `${title}${description ? ` - ${description}` : ''}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText);

  const handleShare = async (platform) => {
    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
    };

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        showToast('Link copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        showToast('Failed to copy link', 'error');
      }
      return;
    }

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: shareUrl,
        });
        trackEvent('share', 'native', title);
      } catch (err) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
      return;
    }

    const link = shareLinks[platform];
    if (link) {
      window.open(link, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
      trackEvent('share', platform, title);
    }
  };

  // Safe trackEvent function (won't break if analytics not loaded)
  const trackEvent = (category, action, label) => {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
        });
      }
    } catch (e) {
      // Silently fail if analytics not available
      console.debug('Analytics not available');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 mr-2">Share:</span>
      
      {/* Native Share (Mobile) */}
      {navigator.share && (
        <button
          onClick={() => handleShare('native')}
          className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
          aria-label="Share using native share"
          title="Share"
        >
          <Share2 size={18} />
        </button>
      )}

      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook')}
        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <Facebook size={18} />
      </button>

      {/* Twitter */}
      <button
        onClick={() => handleShare('twitter')}
        className="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-600 transition-colors"
        aria-label="Share on Twitter"
        title="Share on Twitter"
      >
        <Twitter size={18} />
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => handleShare('linkedin')}
        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <Linkedin size={18} />
      </button>

      {/* Email */}
      <button
        onClick={() => handleShare('email')}
        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        aria-label="Share via Email"
        title="Share via Email"
      >
        <Mail size={18} />
      </button>

      {/* Copy Link */}
      <button
        onClick={() => handleShare('copy')}
        className="p-2 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-600 transition-colors"
        aria-label="Copy link"
        title="Copy link"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
      </button>
    </div>
  );
};

export default SocialShare;

