import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { search } from "@/services/api/postService";
import { CommunityService } from "@/services/api/communityService";
import { useAuth } from "@/layouts/Root";
import ApperIcon from "@/components/ApperIcon";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Login from "@/components/pages/Login";
import SearchBar from "@/components/molecules/SearchBar";

const Header = ({ onCreatePost }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreatePost = () => {
if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    onCreatePost();
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate(`/user/${user?.username || 'guest'}`);
  };
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="MessageSquare" size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ThreadSpace</h1>
          </div>
          
<div className="hidden md:block w-96">
            <SearchBar />
          </div>
        </div>

<div className="flex items-center gap-4">
          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <ApperIcon name="Search" size={20} />
            </Button>
          </div>
          
          <Button onClick={handleCreatePost} size="md" className="flex items-center gap-2">
            <ApperIcon name="Plus" size={16} />
            <span className="hidden sm:inline">Create Post</span>
          </Button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full border-2 border-primary"
                />
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user.username}
                </span>
                <ApperIcon name="ChevronDown" size={16} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-xs text-gray-500">u/{user.username}</p>
                  </div>
                  
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <ApperIcon name="User" size={16} />
                    <span>Profile</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <ApperIcon name="LogOut" size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
<Button 
              onClick={() => {
                const currentPath = window.location.pathname + window.location.search;
                navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
              }} 
              size="md" 
              variant="secondary"
            >
              Login
            </Button>
          )}
        </div>
      </div>
      
<div className="md:hidden px-6 pb-4">
        <SearchBar />
      </div>
    </header>
);
};

export default Header;