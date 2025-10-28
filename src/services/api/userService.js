import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";
async function calculateUserKarma(username) {
  try {
    const apperClient = getApperClient();
    if (!apperClient) return 0;

    // Get user's comments
    const commentsResponse = await apperClient.fetchRecords('comment_c', {
      fields: [{ field: { Name: 'score_c' } }],
      where: [{
        FieldName: 'author_c',
        Operator: 'EqualTo',
        Values: [username]
      }]
    });

    const commentKarma = (commentsResponse.data || []).reduce((sum, c) => sum + (c.score_c || 0), 0);

    // Get user's posts
    const postsResponse = await apperClient.fetchRecords('post_c', {
      fields: [{ field: { Name: 'score_c' } }],
      where: [{
        FieldName: 'author_c',
        Operator: 'EqualTo',
        Values: [username]
      }]
    });

    const postKarma = (postsResponse.data || []).reduce((sum, p) => sum + (p.score_c || 0), 0);

    return postKarma + commentKarma;
  } catch (error) {
    console.error('Error calculating karma:', error);
    return 0;
  }
}

export const UserService = {
  async getAllUsers() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.fetchRecords('user_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'username_c' } },
          { field: { Name: 'display_name_c' } },
          { field: { Name: 'avatar_c' } },
          { field: { Name: 'bio_c' } },
          { field: { Name: 'join_date_c' } },
          { field: { Name: 'karma_c' } }
        ]
      });

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(user => ({
        Id: user.Id,
        username: user.username_c,
        displayName: user.display_name_c,
        avatar: user.avatar_c,
        bio: user.bio_c,
        joinDate: user.join_date_c,
        karma: user.karma_c || 0
      }));
    } catch (error) {
      console.error('Error fetching users:', error?.response?.data?.message || error);
      return [];
    }
  },

  async getAll() {
    const users = await this.getAllUsers();
    const usersWithKarma = await Promise.all(
      users.map(async (user) => ({
        ...user,
        karma: await calculateUserKarma(user.username)
      }))
    );
    return usersWithKarma;
  },

  async getById(id) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('User ID must be an integer');
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.getRecordById('user_c', id, {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'username_c' } },
          { field: { Name: 'display_name_c' } },
          { field: { Name: 'avatar_c' } },
          { field: { Name: 'bio_c' } },
          { field: { Name: 'join_date_c' } },
          { field: { Name: 'karma_c' } }
        ]
      });

      if (!response.success || !response.data) {
        return null;
      }

      const user = response.data;
      return {
        Id: user.Id,
        username: user.username_c,
        displayName: user.display_name_c,
        avatar: user.avatar_c,
        bio: user.bio_c,
        joinDate: user.join_date_c,
        karma: await calculateUserKarma(user.username_c)
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error?.response?.data?.message || error);
      return null;
    }
  },

  async getByUsername(username) {
    try {
      if (!username || typeof username !== 'string') {
        return null;
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.fetchRecords('user_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'username_c' } },
          { field: { Name: 'display_name_c' } },
          { field: { Name: 'avatar_c' } },
          { field: { Name: 'bio_c' } },
          { field: { Name: 'join_date_c' } },
          { field: { Name: 'karma_c' } }
        ],
        where: [{
          FieldName: 'username_c',
          Operator: 'EqualTo',
          Values: [username]
        }],
        pagingInfo: { limit: 1, offset: 0 }
      });

      if (!response.success || !response.data || response.data.length === 0) {
        return null;
      }

      const user = response.data[0];
      return {
        Id: user.Id,
        username: user.username_c,
        displayName: user.display_name_c,
        avatar: user.avatar_c,
        bio: user.bio_c,
        joinDate: user.join_date_c,
        karma: await calculateUserKarma(user.username_c)
      };
    } catch (error) {
      console.error('Error fetching user by username:', error?.response?.data?.message || error);
      return null;
    }
  },

  async getPostsByUser(username) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) return [];

      const response = await apperClient.fetchRecords('post_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'title_c' } },
          { field: { Name: 'author_c' } }
        ],
        where: [{
          FieldName: 'author_c',
          Operator: 'EqualTo',
          Values: [username]
        }]
      });

      if (!response.success) return [];

      return response.data || [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      return [];
    }
  },

  async getCommunitiesByUser(username) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        return { posts: [], comments: [], totalActivity: 0 };
      }

      const [postsResponse, commentsResponse] = await Promise.all([
        apperClient.fetchRecords('post_c', {
          fields: [{ field: { Name: 'Name' } }],
          where: [{
            FieldName: 'author_c',
            Operator: 'EqualTo',
            Values: [username]
          }]
        }),
        apperClient.fetchRecords('comment_c', {
          fields: [{ field: { Name: 'Name' } }],
          where: [{
            FieldName: 'author_c',
            Operator: 'EqualTo',
            Values: [username]
          }]
        })
      ]);

      const posts = postsResponse.success ? (postsResponse.data || []) : [];
      const comments = commentsResponse.success ? (commentsResponse.data || []) : [];

      return {
        posts,
        comments,
        totalActivity: posts.length + comments.length
      };
    } catch (error) {
      console.error('Error fetching user communities:', error);
      return { posts: [], comments: [], totalActivity: 0 };
    }
  },

  async getCommentsByUser(username) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) return [];

      const response = await apperClient.fetchRecords('comment_c', {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'timestamp_c' } },
          { field: { Name: 'score_c' } }
        ],
        where: [{
          FieldName: 'author_c',
          Operator: 'EqualTo',
          Values: [username]
        }]
      });

      if (!response.success) return [];

      return (response.data || []).map(comment => ({
        id: comment.Id,
        author: comment.author_c,
        content: comment.content_c,
        timestamp: comment.timestamp_c,
        score: comment.score_c || 0
      }));
    } catch (error) {
      console.error('Error fetching user comments:', error);
      return [];
    }
  },

  getVotesByUser(username) {
    return [];
  },

  async create(userData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [{
          Name: userData.displayName || userData.username,
          username_c: userData.username,
          display_name_c: userData.displayName,
          avatar_c: userData.avatar,
          bio_c: userData.bio || '',
          join_date_c: new Date().toISOString(),
          karma_c: 0
        }]
      };

      const response = await apperClient.createRecord('user_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to create user');
      }

      if (response.results && response.results.length > 0) {
        const created = response.results[0].data;
        return {
          Id: created.Id,
          username: created.username_c,
          displayName: created.display_name_c,
          avatar: created.avatar_c,
          bio: created.bio_c,
          joinDate: created.join_date_c,
          karma: created.karma_c || 0
        };
      }

      throw new Error('Failed to create user');
    } catch (error) {
      console.error('Error creating user:', error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, userData) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('User ID must be an integer');
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [{
          Id: id,
          ...(userData.displayName && { display_name_c: userData.displayName }),
          ...(userData.avatar && { avatar_c: userData.avatar }),
          ...(userData.bio !== undefined && { bio_c: userData.bio }),
          ...(userData.karma !== undefined && { karma_c: userData.karma })
        }]
      };

      const response = await apperClient.updateRecord('user_c', payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results && response.results.length > 0) {
        const updated = response.results[0].data;
        return {
          Id: updated.Id,
          username: updated.username_c,
          displayName: updated.display_name_c,
          avatar: updated.avatar_c,
          bio: updated.bio_c,
          joinDate: updated.join_date_c,
          karma: updated.karma_c || 0
        };
      }

      return null;
    } catch (error) {
      console.error('Error updating user:', error?.response?.data?.message || error);
      return null;
    }
  },

  async delete(id) {
    try {
      if (!Number.isInteger(id)) {
        throw new Error('User ID must be an integer');
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.deleteRecord('user_c', {
        RecordIds: [id]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting user:', error?.response?.data?.message || error);
return false;
    }
  }
};