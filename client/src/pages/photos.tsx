import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Camera, Plus } from "lucide-react";
import PhotoCard from "@/components/photo-card";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Photos() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch photos
  const { data: photos = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/photos"],
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

  // Like photo mutation
  const likeMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await apiRequest("POST", `/api/photos/${photoId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
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
        description: "Failed to like photo",
        variant: "destructive",
      });
    },
  });

  // Unlike photo mutation
  const unlikeMutation = useMutation({
    mutationFn: async (photoId: string) => {
      await apiRequest("DELETE", `/api/photos/${photoId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
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
        description: "Failed to unlike photo",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = () => {
    alert("Photo upload coming soon!");
  };

  const handleLikeToggle = (photoId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeMutation.mutate(photoId);
    } else {
      likeMutation.mutate(photoId);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-dark">Adventures</h1>
          <Button onClick={handlePhotoUpload} size="sm" className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <div className="animate-pulse">
                      <div className="h-32 bg-gray-300"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : photos.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="font-semibold text-dark mb-2">No photos yet</h3>
                <p className="text-gray-600 mb-4">Share your first adventure photo!</p>
                <Button onClick={handlePhotoUpload} className="bg-primary hover:bg-primary/90">
                  <Camera className="mr-2 h-4 w-4" />
                  Share Photo
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo: any) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onLikeToggle={handleLikeToggle}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={handlePhotoUpload}
        className="fixed bottom-24 right-4 bg-primary text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all z-40"
      >
        <Camera className="h-6 w-6 mx-auto" />
      </button>
    </>
  );
}
