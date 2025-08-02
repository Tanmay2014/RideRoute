import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { MapPin, Navigation } from "lucide-react";

interface LocationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationSettingsModal({ isOpen, onClose }: LocationSettingsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    location: "",
    latitude: 0,
    longitude: 0,
    notificationRadius: 50,
    notificationsEnabled: true,
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Initialize settings from user data
  useEffect(() => {
    if (user) {
      setSettings({
        location: (user as any).location || "",
        latitude: parseFloat((user as any).latitude || "0"),
        longitude: parseFloat((user as any).longitude || "0"),
        notificationRadius: (user as any).notificationRadius || 50,
        notificationsEnabled: (user as any).notificationsEnabled !== false,
      });
    }
  }, [user]);

  const updateLocationMutation = useMutation({
    mutationFn: async (locationData: any) => {
      return await apiRequest("/api/user/location-settings", "PATCH", locationData);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your location and notification preferences have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simple fallback to coordinates if reverse geocoding fails
        try {
          setSettings(prev => ({
            ...prev,
            latitude,
            longitude,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        } catch (error) {
          setSettings(prev => ({
            ...prev,
            latitude,
            longitude,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        }
        
        setIsGettingLocation(false);
        toast({
          title: "Location Updated",
          description: "Your current location has been detected.",
        });
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Location Error",
          description: "Unable to get your current location. Please enter it manually.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    );
  };

  const handleSave = () => {
    if (!settings.location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter your location or use the 'Get Current Location' button.",
        variant: "destructive",
      });
      return;
    }

    updateLocationMutation.mutate(settings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Location & Notifications</span>
          </DialogTitle>
          <DialogDescription>
            Set your location to receive notifications when tours are created nearby.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Your Location</Label>
            <div className="flex space-x-2">
              <Input
                id="location"
                value={settings.location}
                onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                placeholder="Enter your city or address"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex items-center space-x-1"
              >
                <Navigation className={`h-4 w-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">GPS</span>
              </Button>
            </div>
            {settings.latitude !== 0 && settings.longitude !== 0 && (
              <p className="text-xs text-gray-500">
                Coordinates: {settings.latitude.toFixed(4)}, {settings.longitude.toFixed(4)}
              </p>
            )}
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-1">
              <Label>Nearby Tour Notifications</Label>
              <p className="text-sm text-gray-500">
                Get notified when tours are created in your area
              </p>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, notificationsEnabled: checked })
              }
            />
          </div>

          {/* Notification Radius */}
          {settings.notificationsEnabled && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Notification Radius</Label>
                <span className="text-sm font-medium text-gray-700">
                  {settings.notificationRadius} km
                </span>
              </div>
              <Slider
                value={[settings.notificationRadius]}
                onValueChange={(values) => 
                  setSettings({ ...settings, notificationRadius: values[0] })
                }
                max={200}
                min={5}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                You'll receive notifications for tours starting within this distance from your location.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateLocationMutation.isPending}
            className="flex items-center space-x-2"
          >
            {updateLocationMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                <span>Save Settings</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}