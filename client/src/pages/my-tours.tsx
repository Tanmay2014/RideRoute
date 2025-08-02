import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Users, MapPin } from "lucide-react";
import TourCard from "@/components/tour-card";
import TourDetailModal from "@/components/tour-detail-modal";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function MyTours() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  // Fetch user's tours
  const { data: myTours = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/my-tours"],
    retry: false,
  });

  // Handle unauthorized error
  useEffect(() => {
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
  }, [error, toast]);

  const activeTours = myTours.filter((tour: any) => !tour.isClosed && new Date(tour.endDate) > new Date());
  const pastTours = myTours.filter((tour: any) => tour.isClosed || new Date(tour.endDate) <= new Date());

  const handleCreateTour = () => {
    alert("Tour creation coming soon!");
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-dark">My Tours</h1>
          <Button onClick={handleCreateTour} size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <div className="px-4 py-4">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active ({activeTours.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastTours.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="animate-pulse">
                          <div className="h-32 bg-gray-300 rounded mb-4"></div>
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : activeTours.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-semibold text-dark mb-2">No active tours</h3>
                    <p className="text-gray-600 mb-4">Create your first tour to get started!</p>
                    <Button onClick={handleCreateTour} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Tour
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {activeTours.map((tour: any) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      onViewDetails={() => setSelectedTourId(tour.id)}
                      showManageButton={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-4">
              {pastTours.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="font-semibold text-dark mb-2">No past tours</h3>
                    <p className="text-gray-600">Your completed tours will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pastTours.map((tour: any) => (
                    <TourCard
                      key={tour.id}
                      tour={tour}
                      onViewDetails={() => setSelectedTourId(tour.id)}
                      isPast={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Tour Detail Modal */}
      {selectedTourId && (
        <TourDetailModal
          tourId={selectedTourId}
          isOpen={!!selectedTourId}
          onClose={() => setSelectedTourId(null)}
        />
      )}
    </>
  );
}
