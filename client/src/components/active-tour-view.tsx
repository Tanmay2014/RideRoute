import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  AlertTriangle, 
  Users, 
  MessageCircle, 
  MapPin, 
  Navigation, 
  Fuel,
  Crosshair,
  Send,
  Radio,
  PhoneCall
} from "lucide-react";

interface ActiveTourViewProps {
  tour: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ActiveTourView({ tour, isOpen, onClose }: ActiveTourViewProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [activeTab, setActiveTab] = useState("group");

  if (!isOpen) return null;

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement real chat functionality
      setChatMessage("");
    }
  };

  const handleSOS = () => {
    if (confirm("Trigger Emergency SOS? This will alert all group members and emergency contacts.")) {
      // TODO: Implement SOS functionality
      alert("Emergency SOS activated. Help is on the way!");
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Tour Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
          <div>
            <h3 className="font-semibold">{tour.title}</h3>
            <p className="text-white/80 text-sm">Day 2 of 3 • Monterey Bay</p>
          </div>
        </div>
        <Button 
          onClick={handleSOS}
          size="icon"
          className="bg-emergency hover:bg-emergency/80"
        >
          <AlertTriangle className="h-5 w-5" />
        </Button>
      </div>

      {/* Map Section */}
      <div className="h-1/2 bg-gray-200 relative">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop"
          alt="Interactive route map"
          className="w-full h-full object-cover"
        />
        
        {/* Map Overlays */}
        <div className="absolute top-4 left-4 right-4">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="p-3">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">Next Stop:</span>
                  <span className="font-semibold ml-1">Big Sur Overlook</span>
                </div>
                <div>
                  <span className="text-gray-600">ETA:</span>
                  <span className="font-semibold ml-1">2:30 PM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Status */}
        <div className="absolute bottom-4 left-4">
          <Card>
            <CardContent className="p-2">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-success" />
                <span className="font-semibold">8 riders online</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-4 right-4 space-y-2">
          <Button size="icon" className="bg-white text-primary shadow-lg">
            <Navigation className="h-4 w-4" />
          </Button>
          <Button size="icon" className="bg-white text-secondary shadow-lg">
            <Fuel className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="group" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Group</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
              <span className="bg-primary text-white text-xs rounded-full px-2 py-1">3</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Services</span>
            </TabsTrigger>
          </TabsList>

          {/* Group Tab */}
          <TabsContent value="group" className="flex-1 overflow-y-auto p-4">
            <h4 className="font-semibold text-dark mb-3">Riders in Your Group</h4>
            
            <div className="space-y-3 mb-6">
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face"
                      alt="Marcus Rodriguez"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">Marcus Rodriguez</span>
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Leader</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <Navigation className="inline h-3 w-3 text-success mr-1" />
                        Monterey Bay - 0.2 mi
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Crosshair className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face"
                      alt="Alex Chen"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">Alex Chen</span>
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <Navigation className="inline h-3 w-3 text-success mr-1" />
                        Following route - 0.1 mi
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Crosshair className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face"
                      alt="Sarah Johnson"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">Sarah Johnson</span>
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <Fuel className="inline h-3 w-3 text-secondary mr-1" />
                        Fuel stop - 2.1 mi behind
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Crosshair className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Group Actions */}
            <div className="space-y-3">
              <Button className="w-full bg-primary/10 text-primary hover:bg-primary/20">
                <Radio className="mr-2 h-4 w-4" />
                Share My Location
              </Button>
              <Button variant="outline" className="w-full">
                <Users className="mr-2 h-4 w-4" />
                Emergency Regroup
              </Button>
            </div>
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                  alt="Marcus"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <p className="text-sm">Next fuel stop in 15 miles. Beautiful views ahead! 🏍️</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">2:15 PM</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-full"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} size="icon" className="rounded-full">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="flex-1 overflow-y-auto p-4">
            <h4 className="font-semibold text-dark mb-3">Nearby Services</h4>
            
            <div className="space-y-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Fuel className="h-8 w-8 text-secondary" />
                    <div className="flex-1">
                      <h5 className="font-semibold">Shell Station</h5>
                      <p className="text-sm text-gray-600">0.3 miles ahead</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Navigate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🍔</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Coastal Diner</h5>
                      <p className="text-sm text-gray-600">0.8 miles ahead</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Navigate
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🔧</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Bike Repair Shop</h5>
                      <p className="text-sm text-gray-600">2.1 miles behind</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Navigate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
