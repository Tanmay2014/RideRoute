import { Heart, MapPin } from "lucide-react";
import { useState } from "react";

interface PhotoCardProps {
  photo: any;
  onLikeToggle?: (photoId: string, isLiked: boolean) => void;
  showActions?: boolean;
}

export default function PhotoCard({ photo, onLikeToggle, showActions = false }: PhotoCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikeClick = () => {
    if (onLikeToggle) {
      onLikeToggle(photo.id, isLiked);
      setIsLiked(!isLiked);
    }
  };

  return (
    <div className="relative rounded-xl overflow-hidden shadow-sm">
      <img
        src={photo.imageUrl}
        alt={photo.caption || "Adventure photo"}
        className="w-full h-32 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      <div className="absolute bottom-2 left-2 right-2">
        <div className="flex items-center space-x-2 mb-1">
          <img
            src={photo.user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"}
            alt={photo.user?.firstName || "Rider"}
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="text-white text-xs font-medium">
            @{photo.user?.firstName?.toLowerCase() || 'rider'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-white/80 text-xs">
            {photo.location && (
              <>
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{photo.location}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            {showActions ? (
              <button 
                onClick={handleLikeClick}
                className="flex items-center space-x-1 hover:text-white transition-colors"
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                <span className="text-xs">{photo.likesCount || 0}</span>
              </button>
            ) : (
              <>
                <Heart className="h-3 w-3" />
                <span className="text-xs">{photo.likesCount || 0}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
