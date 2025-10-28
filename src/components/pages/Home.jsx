import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import PostFeed from "@/components/organisms/PostFeed";
import CreatePostModal from "@/components/organisms/CreatePostModal";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { searchQuery } = useOutletContext() || { searchQuery: "" };

const handleCreatePost = () => {
    if (!user) {
      const currentPath = window.location.pathname + window.location.search;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    setIsCreatePostOpen(true);
  };

  return (
    <div className="pb-20 lg:pb-6">
      <PostFeed 
        filter="all"
searchQuery={searchQuery}
        onCreatePost={handleCreatePost}
        isCreatePostOpen={isCreatePostOpen}
        onCloseCreatePost={() => setIsCreatePostOpen(false)}
      />
      
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </div>
  );
};

export default Home;