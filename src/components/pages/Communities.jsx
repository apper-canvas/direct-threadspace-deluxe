import { useState } from "react";
import CommunityList from "@/components/organisms/CommunityList";
import CreateCommunityModal from "@/components/organisms/CreateCommunityModal";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Communities = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCommunityCreated = () => {
    setIsCreateModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="pb-20 lg:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Communities</h1>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
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