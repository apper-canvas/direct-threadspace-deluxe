import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import CommunityList from "@/components/organisms/CommunityList";
import CreateCommunityModal from "@/components/organisms/CreateCommunityModal";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Communities = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateCommunity = () => {
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleCommunityCreated = () => {
    setIsCreateModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="pb-20 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
<Button
          onClick={handleCreateCommunity}
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" size={18} />
          Create Community
        </Button>
      </div>
      <CommunityList />
      <CreateCommunityModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCommunityCreated={handleCommunityCreated}
      />
    </div>
  );
};

export default Communities;