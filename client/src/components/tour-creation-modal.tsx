import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, MapPin, Clock, Users } from "lucide-react";

interface TourCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TourStop {
  name: string;
  address: string;
  type: string;
  description?: string;
}

export default function TourCreationModal({ isOpen, onClose }: TourCreationModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startLocation: "",
    endLocation: "",
    startDate: "",
    duration: "",
    difficulty: "beginner",
    maxParticipants: 10,
    price: 0,
  });

  const [stops, setStops] = useState<TourStop[]>([]);
  const [newStop, setNewStop] = useState<TourStop>({
    name: "",
    address: "",
    type: "scenic",
    description: "",
  });

  const createTourMutation = useMutation({
    mutationFn: async (tourData: any) => {
      return await apiRequest("/api/tours", "POST", tourData);
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your tour has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tours"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-tours"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create tour",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      startLocation: "",
      endLocation: "",
      startDate: "",
      duration: "",
      difficulty: "beginner",
      maxParticipants: 10,
      price: 0,
    });
    setStops([]);
    setNewStop({
      name: "",
      address: "",
      type: "scenic",
      description: "",
    });
  };

  const addStop = () => {
    if (newStop.name && newStop.address) {
      setStops([...stops, newStop]);
      setNewStop({
        name: "",
        address: "",
        type: "scenic",
        description: "",
      });
    }
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startLocation || !formData.endLocation || !formData.startDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const tourData = {
      ...formData,
      stops: stops,
      createdById: (user as any)?.id,
    };

    createTourMutation.mutate(tourData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>Create New Tour</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tour Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Scenic Mountain Loop"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your tour..."
                rows={3}
              />
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Route Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startLocation">Start Location *</Label>
                <Input
                  id="startLocation"
                  value={formData.startLocation}
                  onChange={(e) => setFormData({ ...formData, startLocation: e.target.value })}
                  placeholder="Starting point address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="endLocation">End Location *</Label>
                <Input
                  id="endLocation"
                  value={formData.endLocation}
                  onChange={(e) => setFormData({ ...formData, endLocation: e.target.value })}
                  placeholder="Ending point address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tour Stops */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tour Stops (Optional)</h3>
            
            {stops.length > 0 && (
              <div className="space-y-2">
                {stops.map((stop, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{stop.name}</h4>
                          <p className="text-sm text-gray-600">{stop.address}</p>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {stop.type}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStop(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Add Stop</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    value={newStop.name}
                    onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                    placeholder="Stop name"
                  />
                  <Input
                    value={newStop.address}
                    onChange={(e) => setNewStop({ ...newStop, address: e.target.value })}
                    placeholder="Address"
                  />
                </div>
                <div className="flex items-center space-x-3 mt-3">
                  <Select
                    value={newStop.type}
                    onValueChange={(value) => setNewStop({ ...newStop, type: value })}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scenic">Scenic View</SelectItem>
                      <SelectItem value="fuel">Fuel Stop</SelectItem>
                      <SelectItem value="food">Food Break</SelectItem>
                      <SelectItem value="rest">Rest Area</SelectItem>
                      <SelectItem value="photo">Photo Spot</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addStop} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Stop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tour Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date & Time *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 4"
              />
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 10 })}
                min="2"
                max="50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTourMutation.isPending}
              className="flex items-center space-x-2"
            >
              {createTourMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create Tour</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}