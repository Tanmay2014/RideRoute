import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin } from "lucide-react";
import TourCard from "@/components/tour-card";
import TourDetailModal from "@/components/tour-detail-modal";
import { useState } from "react";

export default function Discover() {
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all tours
  const { data: tours = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/tours"],
  });

  const filteredTours = tours.filter((tour: any) =>
    tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.endLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3">
          <h1 className="font-display font-bold text-xl text-dark mb-3">Discover Tours</h1>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tours, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Quick Filters */}
        <section className="px-4 py-4">
          <div className="flex space-x-3 overflow-x-auto">
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              <MapPin className="mr-2 h-3 w-3" />
              Nearby
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              This Weekend
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              Easy Routes
            </Button>
            <Button variant="outline" size="sm" className="whitespace-nowrap">
              Scenic Views
            </Button>
          </div>
        </section>

        {/* Tours List */}
        <section className="px-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
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
          ) : filteredTours.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="font-semibold text-dark mb-2">No tours found</h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search terms" : "Be the first to create a tour!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTours.map((tour: any) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  onViewDetails={() => setSelectedTourId(tour.id)}
                  showParticipants={true}
                />
              ))}
            </div>
          )}
        </section>
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
