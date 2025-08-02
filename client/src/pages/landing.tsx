import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bike, Users, Route, Camera, MapPin, MessageCircle } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      {/* Header */}
      <header className="p-6 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Bike className="text-primary text-4xl" />
          <h1 className="font-display font-bold text-3xl text-dark">RideConnect</h1>
        </div>
        <p className="text-steel text-lg">Connect, Tour, Share</p>
      </header>

      {/* Hero Section */}
      <section className="px-6 mb-8">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-2xl text-dark mb-4">
            Find Your Next Adventure
          </h2>
          <p className="text-steel mb-6">
            Join a community of passionate riders. Create tours, make memories, and share your journey.
          </p>
          <Button onClick={handleLogin} className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg">
            Get Started
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 mb-8">
        <h3 className="font-display font-bold text-xl text-dark mb-6 text-center">
          Why Choose RideConnect?
        </h3>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Route className="text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-dark">Create & Join Tours</h4>
                <p className="text-steel text-sm">Plan amazing routes and connect with fellow riders</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-secondary/10 p-3 rounded-full">
                <Users className="text-secondary" />
              </div>
              <div>
                <h4 className="font-semibold text-dark">Group Management</h4>
                <p className="text-steel text-sm">Real-time location sharing and group coordination</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-success/10 p-3 rounded-full">
                <Camera className="text-success" />
              </div>
              <div>
                <h4 className="font-semibold text-dark">Photo Sharing</h4>
                <p className="text-steel text-sm">Capture and share your journey memories</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="bg-emergency/10 p-3 rounded-full">
                <MapPin className="text-emergency" />
              </div>
              <div>
                <h4 className="font-semibold text-dark">Safety Features</h4>
                <p className="text-steel text-sm">Emergency SOS and location tracking for peace of mind</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-8">
        <Card className="bg-primary text-white">
          <CardContent className="p-6 text-center">
            <h3 className="font-display font-bold text-xl mb-2">Ready to Ride?</h3>
            <p className="mb-4 opacity-90">Join thousands of riders already using RideConnect</p>
            <Button onClick={handleLogin} variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              <Bike className="mr-2 h-4 w-4" />
              Start Your Journey
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
