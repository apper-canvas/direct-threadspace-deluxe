import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { CommunityService } from "@/services/api/communityService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Communities from "@/components/pages/Communities";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import { cn } from "@/utils/cn";
const CommunityList = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  useEffect(() => {
    loadCommunities();
  }, []);

useEffect(() => {
    setJoinedCommunities(CommunityService.getJoinedCommunities());
  }, []);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      setError("");
      const fetchedCommunities = await CommunityService.getAll();
      setCommunities(fetchedCommunities);
    } catch (err) {
      setError("Failed to load communities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

const handleCommunityClick = (communityName) => {
    navigate(`/community/${communityName}`);
  };

const handleJoinCommunity = (e, communityId, communityName) => {
    e.stopPropagation();
    const isCurrentlyJoined = joinedCommunities.includes(communityId);
    
    if (isCurrentlyJoined) {
      CommunityService.leaveCommunity(communityId);
      setJoinedCommunities(prev => prev.filter(id => id !== communityId));
      toast.info(`Left r/${communityName}`);
    } else {
      CommunityService.joinCommunity(communityId);
      setJoinedCommunities(prev => [...prev, communityId]);
      toast.success(`Joined r/${communityName}! Welcome to the community.`);
    }
  };

  if (loading) return <Loading />;
  
  if (error) return <Error message={error} onRetry={loadCommunities} />;
  
  if (communities.length === 0) {
    return (
      <Empty
        title="No communities found"
        description="Communities will appear here as they're created. Check back soon!"
        actionLabel="Refresh"
        onAction={loadCommunities}
      />
    );
  }

return (
    <div className="space-y-6">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
{communities.map(community => {
          const isJoined = joinedCommunities.includes(community.id);
          return (
            <div
              key={community.id}
              onClick={() => handleCommunityClick(community.name)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md hover:border-gray-200 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: community.color }}
                >
                  <ApperIcon name={community.icon || "Users"} size={24} />
                </div>
                <Button
                  variant={isJoined ? "secondary" : "primary"}
                  size="sm"
                  onClick={(e) => handleJoinCommunity(e, community.id, community.name)}
                  className="flex items-center gap-1"
                >
                  <ApperIcon name={isJoined ? "Check" : "Plus"} size={14} />
                  {isJoined ? "Joined" : "Join"}
                </Button>
              </div>
<h3 className="font-bold text-lg text-gray-900 mb-2">
              r/{community.name}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {community.description}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <ApperIcon name="Users" size={14} />
                <span>{community.memberCount?.toLocaleString() || 0} members</span>
              </div>
              <div className="flex items-center gap-1">
                <ApperIcon name="MessageSquare" size={14} />
                <span>{community.postCount || 0} posts</span>
              </div>
            </div>
          </div>
);
      })}
      </div>
    </div>
  );
};

export default CommunityList;