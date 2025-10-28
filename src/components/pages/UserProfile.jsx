import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { UserService } from "@/services/api/userService";
import { toast } from "react-toastify";
import { PostService } from "@/services/api/postService";
import { CommunityService } from "@/services/api/communityService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Communities from "@/components/pages/Communities";
import PostCard from "@/components/organisms/PostCard";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [userCommunities, setUserCommunities] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, [username]);

const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await UserService.getByUsername(username);
      if (!userData) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const allPosts = await PostService.getAll();
      const posts = allPosts.filter(post => post.author === username);

      const comments = UserService.getCommentsByUser(username);

      const communityNames = [...new Set(posts.map(post => post.community))];
      const communities = await Promise.all(
        communityNames.map(name => CommunityService.getByName(name))
      );
      const validCommunities = communities.filter(Boolean);

      setUser(userData);
      setUserPosts(posts);
      setUserComments(comments);
      setUserCommunities(validCommunities);
    } catch (err) {
      setError('Failed to load user profile');
      toast.error('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (postId, voteValue) => {
    try {
      await PostService.vote(postId, voteValue);
      const updatedPosts = userPosts.map(post => {
        if (post.Id === postId) {
          const newScore = post.score + voteValue - (post.userVote || 0);
          return { ...post, score: newScore, userVote: voteValue };
        }
        return post;
      });
      setUserPosts(updatedPosts);
      
      const updatedUser = UserService.getByUsername(username);
      setUser(updatedUser);
      
      toast.success(voteValue > 0 ? 'Upvoted!' : 'Downvoted!');
    } catch (err) {
      toast.error('Failed to vote');
    }
  };

  const handleCommunityClick = (communityName) => {
    navigate(`/?community=${communityName}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!user) {
    return <Error message="User not found" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6 pb-20 lg:pb-6">
      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-20 h-20 rounded-full border-2 border-primary"
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-secondary mb-1">
                {user.displayName}
              </h1>
              <p className="text-gray-500 mb-2">u/{user.username}</p>
              {user.bio && (
                <p className="text-gray-700 mb-3">{user.bio}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <ApperIcon name="Calendar" size={16} />
                  <span>Joined {formatDistanceToNow(new Date(user.joinDate), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-gray-200">
          <div className="p-4 text-center border-r border-gray-200">
            <div className="text-2xl font-bold text-primary">{user.karma}</div>
            <div className="text-sm text-gray-600">Karma</div>
          </div>
          <div className="p-4 text-center border-r border-gray-200">
            <div className="text-2xl font-bold text-accent">{userPosts.length}</div>
            <div className="text-sm text-gray-600">Posts</div>
          </div>
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{userCommunities.length}</div>
            <div className="text-sm text-gray-600">Communities</div>
</div>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Posts ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comments ({userComments.length})
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Activity
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'posts' && (
            <div>
              {userPosts.length === 0 ? (
                <Empty message="No posts yet" />
              ) : (
                <div className="space-y-4">
                  {userPosts.map(post => (
                    <PostCard key={post.Id} post={post} onVote={handleVote} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              {userComments.length === 0 ? (
                <Empty message="No comments yet" />
              ) : (
                <div className="space-y-4">
                  {userComments.map(comment => (
                    <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center gap-1">
                          <button className="text-gray-400 hover:text-primary p-1">
                            <ApperIcon name="ArrowUp" size={16} />
                          </button>
                          <span className="text-sm font-medium">{comment.score}</span>
                          <button className="text-gray-400 hover:text-accent p-1">
                            <ApperIcon name="ArrowDown" size={16} />
                          </button>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-2">
                            Commented {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <ApperIcon name="Activity" size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600">
                  Activity tracking coming soon
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  This will show a combined timeline of posts, comments, and votes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-secondary mb-4">Communities</h2>
        {userCommunities.length === 0 ? (
          <Empty message="Not active in any communities yet" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userCommunities.map(community => (
              <button
                key={community.Id}
                onClick={() => handleCommunityClick(community.name)}
                className="bg-surface p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {community.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-secondary">r/{community.name}</div>
                    <div className="text-sm text-gray-600">{community.memberCount.toLocaleString()} members</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;