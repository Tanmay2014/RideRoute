import { useLocation } from "wouter";
import { Home, Compass, Route, Camera, User } from "lucide-react";

export default function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Discover", href: "/discover", icon: Compass },
    { name: "My Tours", href: "/my-tours", icon: Route },
    { name: "Photos", href: "/photos", icon: Camera },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={`flex flex-col items-center p-2 ${
                  isActive ? "text-primary" : "text-gray-500 hover:text-primary"
                }`}
              >
                <Icon className="text-lg mb-1 h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
