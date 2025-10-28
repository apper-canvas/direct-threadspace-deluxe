import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

export class PostService {
  static savedPostIds = new Set();

  static async search(query) {
    try {
      if (!query || !query.trim()) {
        return [];
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const searchTerm = query.toLowerCase().trim();
      
      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'community_c' } },
          { field: { Name: 'score_c' } },
          { field: { Name: 'user_vote_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'comment_count_c' } },
          { field: { Name: 'tags_c' } },
          { field: { Name: 'post_type_c' } },
          { field: { Name: 'image_url_c' } },
          { field: { Name: 'link_url_c' } },
          { field: { Name: 'poll_options_c' } },
          { field: { Name: 'user_poll_vote_c' } }
        ]
      });

      if (!response.success) {
        return [];
      }

      const results = [];
      for (const post of (response.data || [])) {
        const title = post.title_c || '';
        const content = post.content_c || '';
        const author = post.author_c || '';
        const tags = post.tags_c || [];

        const titleMatch = title.toLowerCase().includes(searchTerm);
        const contentMatch = content.toLowerCase().includes(searchTerm);
        const authorMatch = author.toLowerCase().includes(searchTerm);
        const tagMatch = Array.isArray(tags) && tags.some(tag => tag.toLowerCase().includes(searchTerm));

        if (titleMatch || contentMatch || authorMatch || tagMatch) {
          let snippet = '';
          
          if (titleMatch) {
            const index = title.toLowerCase().indexOf(searchTerm);
            const start = Math.max(0, index - 30);
            const end = Math.min(title.length, index + searchTerm.length + 30);
            snippet = title.substring(start, end);
          } else if (contentMatch) {
            const index = content.toLowerCase().indexOf(searchTerm);
            const start = Math.max(0, index - 40);
            const end = Math.min(content.length, index + searchTerm.length + 40);
            snippet = content.substring(start, end);
          } else if (tagMatch && Array.isArray(tags)) {
            const matchedTag = tags.find(tag => tag.toLowerCase().includes(searchTerm));
            snippet = `Tagged with: ${matchedTag}`;
          } else if (authorMatch) {
            snippet = `Posted by u/${author}`;
          }

          results.push({
            post: this.transformPost(post),
            snippet: snippet.trim()
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching posts:', error?.response?.data?.message || error);
      return [];
    }
  }

  static transformPost(post) {
    let pollOptions = null;
    if (post.poll_options_c) {
      try {
        pollOptions = typeof post.poll_options_c === 'string' 
          ? JSON.parse(post.poll_options_c) 
          : post.poll_options_c;
      } catch (e) {
        console.error('Error parsing poll options:', e);
      }
    }

    return {
      Id: post.Id,
      id: `post_${post.Id}`,
      title: post.title_c || '',
      content: post.content_c || null,
      author: post.author_c || '',
      community: post.community_c || '',
      score: post.score_c || 0,
      userVote: post.user_vote_c || 0,
      timestamp: post.timestamp_c || new Date().toISOString(),
      commentCount: post.comment_count_c || 0,
      tags: Array.isArray(post.tags_c) ? post.tags_c : [],
      postType: post.post_type_c || 'text',
      imageUrl: post.image_url_c || null,
      linkUrl: post.link_url_c || null,
      pollOptions: pollOptions,
      userPollVote: post.user_poll_vote_c || null
    };
  }

  static async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'community_c' } },
          { field: { Name: 'score_c' } },
          { field: { Name: 'user_vote_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'comment_count_c' } },
          { field: { Name: 'tags_c' } },
          { field: { Name: 'post_type_c' } },
          { field: { Name: 'image_url_c' } },
          { field: { Name: 'link_url_c' } },
          { field: { Name: 'poll_options_c' } },
          { field: { Name: 'user_poll_vote_c' } }
        ],
        orderBy: [{ fieldName: 'timestamp_c', sorttype: 'DESC' }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(post => this.transformPost(post));
    } catch (error) {
      console.error('Error fetching posts:', error?.response?.data?.message || error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.getRecordById('post_c', parseInt(id), {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'community_c' } },
          { field: { Name: 'score_c' } },
          { field: { Name: 'user_vote_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'comment_count_c' } },
          { field: { Name: 'tags_c' } },
          { field: { Name: 'post_type_c' } },
          { field: { Name: 'image_url_c' } },
          { field: { Name: 'link_url_c' } },
          { field: { Name: 'poll_options_c' } },
          { field: { Name: 'user_poll_vote_c' } }
        ]
      });

      if (!response.success || !response.data) {
        return null;
      }

      return this.transformPost(response.data);
    } catch (error) {
      console.error('Error fetching post by ID:', error?.response?.data?.message || error);
      return null;
    }
  }

  static async getPopular() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'community_c' } },
          { field: { Name: 'score_c' } },
          { field: { Name: 'user_vote_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'comment_count_c' } },
          { field: { Name: 'tags_c' } },
          { field: { Name: 'post_type_c' } },
          { field: { Name: 'image_url_c' } },
          { field: { Name: 'link_url_c' } },
          { field: { Name: 'poll_options_c' } },
          { field: { Name: 'user_poll_vote_c' } }
        ],
        where: [{
          FieldName: 'score_c',
          Operator: 'GreaterThanOrEqualTo',
          Values: [50]
        }],
        orderBy: [{ fieldName: 'score_c', sorttype: 'DESC' }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(post => this.transformPost(post));
    } catch (error) {
      console.error('Error fetching popular posts:', error?.response?.data?.message || error);
      return [];
    }
  }

  static async getByCommunity(communityName) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'community_c' } },
          { field: { Name: 'score_c' } },
          { field: { Name: 'user_vote_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'comment_count_c' } },
          { field: { Name: 'tags_c' } },
          { field: { Name: 'post_type_c' } },
          { field: { Name: 'image_url_c' } },
          { field: { Name: 'link_url_c' } },
          { field: { Name: 'poll_options_c' } },
          { field: { Name: 'user_poll_vote_c' } }
        ],
        where: [{
          FieldName: 'community_c',
          Operator: 'EqualTo',
          Values: [communityName]
        }],
        orderBy: [{ fieldName: 'timestamp_c', sorttype: 'DESC' }]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(post => this.transformPost(post));
    } catch (error) {
      console.error('Error fetching community posts:', error?.response?.data?.message || error);
      return [];
    }
  }

  static async addComment(postId, commentId) {
    try {
      const post = await this.getById(postId);
      if (!post) return false;

      const newCommentCount = (post.commentCount || 0) + 1;
      
      const apperClient = getApperClient();
      if (!apperClient) return false;

      const response = await apperClient.updateRecord('post_c', {
        records: [{
          Id: parseInt(postId),
          comment_count_c: newCommentCount
        }]
      });

      return response.success;
    } catch (error) {
      console.error('Error adding comment to post:', error);
      return false;
    }
  }

  static async create(postData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const pollOptionsString = postData.pollOptions 
        ? JSON.stringify(postData.pollOptions)
        : null;

      const payload = {
        records: [{
          Name: postData.title,
          title_c: postData.title,
          content_c: postData.content || null,
          author_c: postData.author,
          community_c: postData.community,
          score_c: postData.score || 1,
          user_vote_c: postData.userVote || 1,
          timestamp_c: postData.timestamp || new Date().toISOString(),
          comment_count_c: 0,
          tags_c: postData.tags && postData.tags.length > 0 ? postData.tags.join(',') : null,
          post_type_c: postData.postType || 'text',
          image_url_c: postData.imageUrl || null,
          link_url_c: postData.linkUrl || null,
          poll_options_c: pollOptionsString,
          user_poll_vote_c: null
        }]
      };

      const response = await apperClient.createRecord('post_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to create post');
      }

      if (response.results && response.results.length > 0) {
        const created = response.results[0];
        if (created.success) {
          return this.transformPost(created.data);
        } else {
          throw new Error(created.message || 'Failed to create post');
        }
      }

      throw new Error('Failed to create post');
    } catch (error) {
      console.error('Error creating post:', error?.response?.data?.message || error);
      throw error;
    }
  }

  static async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [{
          Id: parseInt(id),
          ...(updateData.title && { title_c: updateData.title }),
          ...(updateData.content !== undefined && { content_c: updateData.content }),
          ...(updateData.score !== undefined && { score_c: updateData.score }),
          ...(updateData.userVote !== undefined && { user_vote_c: updateData.userVote }),
          ...(updateData.commentCount !== undefined && { comment_count_c: updateData.commentCount }),
          ...(updateData.tags && { tags_c: updateData.tags.join(',') }),
          ...(updateData.pollOptions && { poll_options_c: JSON.stringify(updateData.pollOptions) }),
          ...(updateData.userPollVote !== undefined && { user_poll_vote_c: updateData.userPollVote })
        }]
      };

      const response = await apperClient.updateRecord('post_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const updated = response.results[0];
        if (updated.success) {
          return this.transformPost(updated.data);
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating post:', error?.response?.data?.message || error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.deleteRecord('post_c', {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting post:', error?.response?.data?.message || error);
      return false;
    }
  }

  static async vote(postId, voteValue) {
    try {
      const post = await this.getById(postId);
      if (!post) return null;

      const oldVote = post.userVote || 0;
      const newVote = oldVote === voteValue ? 0 : voteValue;
      const scoreDiff = newVote - oldVote;

      const newScore = post.score + scoreDiff;

      await this.update(post.Id, { 
        score: newScore, 
        userVote: newVote 
      });

      return { 
        ...post, 
        score: newScore, 
        userVote: newVote 
      };
    } catch (error) {
      console.error('Error voting on post:', error);
      return null;
    }
  }

  static async pollVote(postId, optionId) {
    try {
      const post = await this.getById(postId);
      if (!post || post.postType !== 'poll' || !post.pollOptions) return null;

      const option = post.pollOptions.find(opt => opt.Id === optionId);
      if (!option) return null;

      // Remove previous vote if exists
      if (post.userPollVote !== null) {
        const prevOption = post.pollOptions.find(opt => opt.Id === post.userPollVote);
        if (prevOption) {
          prevOption.voteCount = Math.max(0, prevOption.voteCount - 1);
        }
      }

      // Add new vote or remove if voting for same option
      let newUserPollVote;
      if (post.userPollVote === optionId) {
        newUserPollVote = null;
      } else {
        option.voteCount += 1;
        newUserPollVote = optionId;
      }

      await this.update(post.Id, {
        pollOptions: post.pollOptions,
        userPollVote: newUserPollVote
      });

      return {
        ...post,
        pollOptions: post.pollOptions,
        userPollVote: newUserPollVote
      };
    } catch (error) {
      console.error('Error voting on poll:', error);
      return null;
    }
  }

  static async toggleSave(postId) {
    if (this.savedPostIds.has(postId)) {
      this.savedPostIds.delete(postId);
      return { saved: false };
    } else {
      this.savedPostIds.add(postId);
      return { saved: true };
    }
  }

  static async isSaved(postId) {
    return this.savedPostIds.has(postId);
  }

  static async getSaved() {
    try {
      const allPosts = await this.getAll();
      return allPosts.filter(post => this.savedPostIds.has(post.id));
    } catch (error) {
      console.error('Error getting saved posts:', error);
      return [];
    }
  }
}