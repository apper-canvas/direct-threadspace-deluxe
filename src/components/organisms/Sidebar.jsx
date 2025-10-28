import { useLocation, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import { CommunityService } from "@/services/api/communityService";
const Sidebar = ({ className, isMobile = false, onItemClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
const { user } = useAuth();
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const loadJoinedCommunities = async () => {
      try {
        const joinedIds = CommunityService.getJoinedCommunities();
        const allCommunities = await CommunityService.getAll();
        const joined = allCommunities.filter(c => joinedIds.includes(c.id));
        setCommunities(joined);
      } catch (error) {
        console.error("Error loading joined communities:", error);
      }
    };

    loadJoinedCommunities();
  }, []);

  useEffect(() => {
    setJoinedCommunities(CommunityService.getJoinedCommunities());
  }, [location]);

const navigationItems = [
    { path: "", label: "Home", icon: "Home" },
    { path: "popular", label: "Popular", icon: "TrendingUp" },
    { path: "saved", label: "Saved", icon: "Bookmark" },
    { path: "communities", label: "Communities", icon: "Users" },
    { path: user ? `user/${user.username}` : "user/guest", label: "Profile", icon: "User" }
  ];

  const handleNavigation = (path) => {
    navigate(`/${path}`);
    if (onItemClick) onItemClick();
  };

  const isActive = (path) => {
    if (path === "") {
      return location.pathname === "/";
    }
    return location.pathname === `/${path}`;
  };

  return (
    <aside className={cn(
      "bg-white border-r border-gray-200 h-full",
      isMobile ? "w-full" : "w-60",
      className
    )}>
      <div className="p-6">
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg font-medium transition-all duration-200 group",
                isActive(item.path)
                  ? "bg-primary/10 text-primary border-l-4 border-primary"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent"
              )}
            >
              <ApperIcon 
                name={item.icon} 
                size={20} 
                className={cn(
                  "transition-colors duration-200",
                  isActive(item.path) ? "text-primary" : "text-gray-500 group-hover:text-gray-700"
                )} 
              />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
{/* Joined Communities Section */}
      {communities.length > 0 && (
        <div className="px-6 mt-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Your Communities
          </h3>
          <div className="space-y-1">
            {communities.slice(0, 5).map(community => (
              <button
                key={community.id}
                onClick={() => handleNavigation(`community/${community.name}`)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                  location.pathname === `/community/${community.name}`
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: community.color }}
                >
                  <ApperIcon name={community.icon || "Users"} size={16} />
                </div>
                <span className="text-sm font-medium truncate">r/{community.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 mt-8">
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            {communities.length > 0 ? "Discover More" : "Join Communities"}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {communities.length > 0
              ? "Explore and join more communities"
              : "Discover and participate in discussions about your interests"}
          </p>
          <button
            onClick={() => handleNavigation("communities")}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
          >
            Explore Communities
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;