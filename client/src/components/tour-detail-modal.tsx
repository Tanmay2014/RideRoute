import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Share, MapPin, Calendar, Users, Star, DollarSign, Route, Bike, Bookmark, MessageCircle, Fuel, Camera, Bed } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface TourDetailModalProps {
  tourId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TourDetailModal({ tourId, isOpen, onClose }: TourDetailModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch tour details
  const { data: tour, isLoading } = useQuery<any>({
    queryKey: ["/api/tours", tourId],
    enabled: isOpen && !!tourId,
  });

  // Join tour mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/tours/${tourId}/join`);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've successfully joined the tour!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-tours"] });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to join tour. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!tour && !isLoading) return null;

  const participantCount = tour?.participants?.length || 0;
  const spotsLeft = tour ? tour.maxParticipants - participantCount : 0;
  const isParticipant = tour?.participants?.some((p: any) => p.userId === (user as any)?.id);
  const isCreator = tour?.createdById === (user as any)?.id;

  const getStopIcon = (type: string) => {
    switch (type) {
      case "fuel": return <Fuel className="h-4 w-4 text-secondary" />;
      case "food": return <div className="h-4 w-4 bg-orange-500 rounded-full" />;
      case "scenic": return <Camera className="h-4 w-4 text-green-500" />;
      case "accommodation": return <Bed className="h-4 w-4 text-blue-500" />;
      case "repair": return <div className="h-4 w-4 bg-red-500 rounded-full" />;
      default: return <MapPin className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-48 bg-gray-300 rounded"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
                <DialogTitle className="font-display font-bold text-lg">Tour Details</DialogTitle>
                <Button variant="ghost" size="icon">
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Tour Image */}
            <div className="relative">
              <img
                src={tour.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=300&fit=crop"}
                alt={tour.title}
                className="w-full h-48 object-cover"
              />
              {spotsLeft > 0 && (
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-dark">{spotsLeft} spots left</span>
                </div>
              )}
            </div>

            {/* Tour Info */}
            <div className="p-4 space-y-4">
              {/* Title and Rating */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-display font-bold text-2xl text-dark mb-2">{tour.title}</h3>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-secondary fill-current" />
                      <span className="font-medium">4.8</span>
                      <span className="text-sm">(23 reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{participantCount}/{tour.maxParticipants} riders</span>
                    </div>
                  </div>
                </div>
                {tour.price && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">From</div>
                    <div className="text-2xl font-bold text-primary">${tour.price}</div>
                  </div>
                )}
              </div>

              {/* Route Details */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-dark mb-3">Route Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <span className="font-medium">{tour.startLocation}</span>
                    </div>
                    
                    {tour.stops?.map((stop: any, index: number) => (
                      <div key={stop.id} className="flex items-center space-x-3 ml-6">
                        {getStopIcon(stop.stopType)}
                        <span className="text-gray-600 text-sm">{stop.name}</span>
                      </div>
                    ))}
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emergency rounded-full"></div>
                      <span className="font-medium">{tour.endLocation}</span>
                    </div>
                  </div>
                  
                  {tour.distance && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-300">
                      <span className="text-sm text-gray-600">Total Distance</span>
                      <span className="font-semibold">{tour.distance} miles</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tour Dates */}
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(tour.startDate), "MMM dd")} - {format(new Date(tour.endDate), "MMM dd, yyyy")}
                </span>
              </div>

              {/* Difficulty */}
              {tour.difficulty && (
                <div>
                  <Badge 
                    variant={tour.difficulty === "easy" ? "secondary" : tour.difficulty === "moderate" ? "default" : "destructive"}
                  >
                    {tour.difficulty} difficulty
                  </Badge>
                </div>
              )}

              {/* What's Included */}
              <div>
                <h4 className="font-semibold text-dark mb-3">What's Included</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Route className="h-4 w-4 text-primary" />
                    <span className="text-sm text-gray-700">GPS Route</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm text-gray-700">Group Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <span className="text-sm text-gray-700">Group Chat</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 bg-emergency rounded-full" />
                    <span className="text-sm text-gray-700">Emergency SOS</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {tour.description && (
                <div>
                  <h4 className="font-semibold text-dark mb-2">Description</h4>
                  <p className="text-gray-700 text-sm">{tour.description}</p>
                </div>
              )}

              {/* Participants */}
              {tour.participants?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-dark mb-3">Participants</h4>
                  <div className="space-y-2">
                    {tour.participants.slice(0, 5).map((participant: any) => (
                      <div key={participant.id} className="flex items-center space-x-3">
                        <img
                          src={participant.user.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"}
                          alt={participant.user.firstName || "Rider"}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">
                          {participant.user.firstName && participant.user.lastName
                            ? `${participant.user.firstName} ${participant.user.lastName}`
                            : participant.user.email?.split('@')[0] || 'Rider'
                          }
                        </span>
                        {participant.userId === tour.createdById && (
                          <Badge variant="secondary" className="text-xs">Leader</Badge>
                        )}
                      </div>
                    ))}
                    {tour.participants.length > 5 && (
                      <div className="text-sm text-gray-600">
                        +{tour.participants.length - 5} more riders
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Action Buttons */}
              <div className="space-y-3">
                {!isCreator && !isParticipant && spotsLeft > 0 && (
                  <Button 
                    onClick={() => joinMutation.mutate()}
                    disabled={joinMutation.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 text-lg"
                  >
                    <Bike className="mr-2 h-5 w-5" />
                    {joinMutation.isPending ? "Joining..." : `Join Tour${tour.price ? ` - $${tour.price}` : ""}`}
                  </Button>
                )}
                
                {isParticipant && (
                  <Button variant="outline" className="w-full py-3 text-lg" disabled>
                    <Users className="mr-2 h-5 w-5" />
                    Already Joined
                  </Button>
                )}
                
                {isCreator && (
                  <Button variant="outline" className="w-full py-3 text-lg" disabled>
                    <Star className="mr-2 h-5 w-5" />
                    Your Tour
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="py-3">
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" className="py-3">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
