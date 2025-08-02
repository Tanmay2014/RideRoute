import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Users, Star, Settings } from "lucide-react";
import { format } from "date-fns";

interface TourCardProps {
  tour: any;
  onViewDetails: () => void;
  showParticipants?: boolean;
  showManageButton?: boolean;
  isPast?: boolean;
}

export default function TourCard({ 
  tour, 
  onViewDetails, 
  showParticipants = false, 
  showManageButton = false,
  isPast = false
}: TourCardProps) {
  const participantCount = tour.participants?.length || 0;
  const spotsLeft = tour.maxParticipants - participantCount;

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={tour.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop"}
          alt={tour.title}
          className="w-full h-32 object-cover"
        />
        {!isPast && spotsLeft > 0 && (
          <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-dark">
            {spotsLeft} spots left
          </div>
        )}
        {isPast && (
          <div className="absolute top-3 right-3 bg-gray-800/80 px-2 py-1 rounded-full text-xs font-semibold text-white">
            Completed
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-dark text-lg line-clamp-1">{tour.title}</h4>
          {tour.rating && (
            <div className="flex items-center space-x-1 text-secondary">
              <Star className="h-3 w-3 fill-current" />
              <span className="text-sm font-medium">{tour.rating}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-2">
          <MapPin className="h-3 w-3 mr-2" />
          <span className="line-clamp-1">{tour.startLocation} → {tour.endLocation}</span>
        </div>
        
        <div className="flex items-center text-gray-600 text-sm mb-3">
          <Calendar className="h-3 w-3 mr-2" />
          <span>{format(new Date(tour.startDate), "MMM dd")} - {format(new Date(tour.endDate), "MMM dd, yyyy")}</span>
          {showParticipants && (
            <>
              <Users className="h-3 w-3 ml-4 mr-2" />
              <span>{participantCount}/{tour.maxParticipants} riders</span>
            </>
          )}
        </div>
        
        {tour.difficulty && (
          <div className="mb-3">
            <Badge 
              variant={tour.difficulty === "easy" ? "secondary" : tour.difficulty === "moderate" ? "default" : "destructive"}
              className="text-xs"
            >
              {tour.difficulty}
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          {showParticipants && tour.participants?.length > 0 && (
            <div className="flex -space-x-2">
              {tour.participants.slice(0, 3).map((participant: any, index: number) => (
                <img
                  key={participant.user.id}
                  src={participant.user.profileImageUrl || `https://images.unsplash.com/photo-${1500000000000 + index}?w=40&h=40&fit=crop&crop=face`}
                  alt={participant.user.firstName || "Rider"}
                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                />
              ))}
              {participantCount > 3 && (
                <div className="w-6 h-6 rounded-full bg-primary border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                  +{participantCount - 3}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-2 ml-auto">
            {showManageButton && (
              <Button variant="outline" size="sm">
                <Settings className="h-3 w-3 mr-1" />
                Manage
              </Button>
            )}
            <Button 
              onClick={onViewDetails}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
