import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin, Calendar, Star, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's photos
  const { data: userPhotos = [], error: photosError } = useQuery<any[]>({
    queryKey: ["/api/users", (user as any)?.id, "photos"],
    enabled: !!(user as any)?.id,
    retry: false,
  });

  // Fetch user's tours
  const { data: userTours = [], error: toursError } = useQuery<any[]>({
    queryKey: ["/api/my-tours"],
    retry: false,
  });

  // Handle unauthorized errors
  useEffect(() => {
    const handleError = (error: any) => {
      if (error && isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    };

    handleError(photosError);
    handleError(toursError);
  }, [photosError, toursError, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleEditProfile = () => {
    alert("Profile editing coming soon!");
  };

  const stats = {
    tours: userTours.length,
    photos: userPhotos.length,
    completedTours: userTours.filter((tour: any) => tour.isClosed).length,
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-dark">Profile</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleEditProfile}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Profile Info */}
        <section className="px-4 py-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=face"}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h2 className="font-display font-bold text-xl text-dark">
                    {(user as any)?.firstName && (user as any)?.lastName 
                      ? `${(user as any).firstName} ${(user as any).lastName}`
                      : (user as any)?.email?.split('@')[0] || 'Rider'
                    }
                  </h2>
                  {(user as any)?.email && (
                    <p className="text-steel text-sm">{(user as any).email}</p>
                  )}
                  {(user as any)?.location && (
                    <div className="flex items-center space-x-1 text-gray-600 text-sm mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>{(user as any).location}</span>
                    </div>
                  )}
                </div>
              </div>

              {(user as any)?.bio && (
                <p className="text-gray-700 mb-4">{(user as any).bio}</p>
              )}

              <div className="flex items-center space-x-1 text-gray-600 text-sm mb-4">
                <Calendar className="h-3 w-3" />
                <span>Joined {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>

              <Button onClick={handleEditProfile} className="w-full bg-primary hover:bg-primary/90">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Stats */}
        <section className="px-4 pb-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.tours}</div>
                <div className="text-sm text-gray-600">Tours Created</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">{stats.photos}</div>
                <div className="text-sm text-gray-600">Photos Shared</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats.completedTours}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Recent Photos */}
        <section className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-xl text-dark">Recent Photos</h3>
            <Button variant="ghost" className="text-primary font-semibold p-0">
              View All
            </Button>
          </div>

          {userPhotos.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">No photos shared yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {userPhotos.slice(0, 6).map((photo: any) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src={photo.imageUrl}
                    alt={photo.caption || "User photo"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Achievements */}
        <section className="px-4 pb-6">
          <h3 className="font-display font-bold text-xl text-dark mb-4">Achievements</h3>
          <div className="space-y-2">
            <Badge variant="secondary" className="mr-2">
              <Star className="mr-1 h-3 w-3" />
              First Tour
            </Badge>
            {stats.tours >= 5 && (
              <Badge variant="secondary" className="mr-2">
                <Star className="mr-1 h-3 w-3" />
                Tour Creator
              </Badge>
            )}
            {stats.photos >= 10 && (
              <Badge variant="secondary" className="mr-2">
                <Star className="mr-1 h-3 w-3" />
                Photo Enthusiast
              </Badge>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
