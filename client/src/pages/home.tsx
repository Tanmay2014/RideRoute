import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Bike, Settings } from "lucide-react";
import TourCard from "@/components/tour-card";
import PhotoCard from "@/components/photo-card";
import TourDetailModal from "@/components/tour-detail-modal";
import TourCreationModal from "@/components/tour-creation-modal";
import NotificationBell from "@/components/notification-bell";
import LocationSettingsModal from "@/components/location-settings-modal";
import { useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  // Fetch stats
  const { data: stats } = useQuery<{activeTours: number; totalRiders: number; completedTours: number}>({
    queryKey: ["/api/stats"],
  });

  // Fetch featured tours
  const { data: tours = [] } = useQuery<any[]>({
    queryKey: ["/api/tours"],
  });

  // Fetch recent photos
  const { data: photos = [] } = useQuery<any[]>({
    queryKey: ["/api/photos"],
  });

  const handleCreateTour = () => {
    setShowCreateModal(true);
  };

  return (
    <>
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bike className="text-primary text-2xl" />
            <h1 className="font-display font-bold text-xl text-dark">RideConnect</h1>
          </div>
          <div className="flex items-center space-x-2">
            <NotificationBell />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowLocationSettings(true)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </Button>
            <button className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop&crop=face"}
                alt="User profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative">
          <div
            className="h-48 bg-gradient-to-r from-primary to-secondary relative overflow-hidden"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 p-6 text-white">
              <h2 className="font-display font-bold text-2xl mb-2">Find Your Next Adventure</h2>
              <p className="text-white/90 mb-4">Connect with fellow riders and explore amazing routes together</p>
              <Button
                onClick={handleCreateTour}
                className="bg-white text-primary px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Tour
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="px-4 py-6">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats?.activeTours || 0}</div>
                <div className="text-sm text-gray-600">Active Tours</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">{stats?.totalRiders || 0}</div>
                <div className="text-sm text-gray-600">Total Riders</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success">{stats?.completedTours || 0}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Featured Tours */}
        <section className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-xl text-dark">Featured Tours</h3>
            <Button variant="ghost" className="text-primary font-semibold p-0">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {tours.slice(0, 3).map((tour: any) => (
              <TourCard
                key={tour.id}
                tour={tour}
                onViewDetails={() => setSelectedTourId(tour.id)}
              />
            ))}
          </div>
        </section>

        {/* Photo Sharing Section */}
        <section className="px-4 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-xl text-dark">Recent Adventures</h3>
            <Button variant="ghost" className="text-primary font-semibold p-0">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {photos.slice(0, 4).map((photo: any) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={handleCreateTour}
        className="fixed bottom-24 right-4 bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-40"
      >
        <Plus className="h-6 w-6 mx-auto" />
      </button>

      {/* Tour Detail Modal */}
      {selectedTourId && (
        <TourDetailModal
          tourId={selectedTourId}
          isOpen={!!selectedTourId}
          onClose={() => setSelectedTourId(null)}
        />
      )}

      {/* Tour Creation Modal */}
      <TourCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Location Settings Modal */}
      <LocationSettingsModal
        isOpen={showLocationSettings}
        onClose={() => setShowLocationSettings(false)}
      />
    </>
  );
}
