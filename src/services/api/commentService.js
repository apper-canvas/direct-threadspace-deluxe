import { getApperClient } from '@/services/apperClient';
import { toast } from 'react-toastify';

class CommentService {
  constructor() {
    this.tableName = 'comment_c';
  }

  async getByPostId(postId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.fetchRecords(this.tableName, {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'parent_id_c' } },
          { field: { Name: 'post_id_c' } },
          { field: { Name: 'score_c' } },
          { field: { Name: 'timestamp_c' } }
        ],
        where: [{
          FieldName: 'post_id_c',
          Operator: 'EqualTo',
          Values: [parseInt(postId)]
        }]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return (response.data || []).map(comment => ({
        Id: comment.Id,
        id: comment.Id,
        postId: comment.post_id_c,
        parentId: comment.parent_id_c,
        author: comment.author_c,
        content: comment.content_c,
        timestamp: comment.timestamp_c,
        score: comment.score_c || 0
      }));
    } catch (error) {
      console.error('Error fetching comments:', error?.response?.data?.message || error);
      toast.error('Failed to load comments');
      return [];
    }
  }

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const response = await apperClient.getRecordById(this.tableName, parseInt(id), {
        fields: [
          { field: { Name: 'Name' } },
          { field: { Name: 'author_c' } },
          { field: { Name: 'content_c' } },
          { field: { Name: 'parent_id_c' } },
          { field: { Name: 'post_id_c' } },
          { field: { Name: 'score_c' } },
          { field: { Name: 'timestamp_c' } }
        ]
      });

      if (!response.success || !response.data) {
        throw new Error('Comment not found');
      }

      const comment = response.data;
      return {
        Id: comment.Id,
        id: comment.Id,
        postId: comment.post_id_c,
        parentId: comment.parent_id_c,
        author: comment.author_c,
        content: comment.content_c,
        timestamp: comment.timestamp_c,
        score: comment.score_c || 0
      };
    } catch (error) {
      console.error('Error fetching comment:', error?.response?.data?.message || error);
      throw new Error('Comment not found');
    }
  }

  async create(commentData) {
    try {
      if (!commentData.author) {
        throw new Error('Author is required');
      }

      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [{
          Name: `Comment by ${commentData.author}`,
          author_c: commentData.author,
          content_c: commentData.content.trim(),
          post_id_c: parseInt(commentData.postId),
          parent_id_c: commentData.parentId ? parseInt(commentData.parentId) : null,
          timestamp_c: new Date().toISOString(),
          score_c: 0
        }]
      };

      const response = await apperClient.createRecord(this.tableName, payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to create comment');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to create comment');
        }

        if (successful.length > 0) {
          const created = successful[0].data;
          return {
            Id: created.Id,
            id: created.Id,
            postId: created.post_id_c,
            parentId: created.parent_id_c,
            author: created.author_c,
            content: created.content_c,
            timestamp: created.timestamp_c,
            score: created.score_c || 0
          };
        }
      }

      throw new Error('Failed to create comment');
    } catch (error) {
      console.error('Error creating comment:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      const payload = {
        records: [{
          Id: parseInt(id),
          ...(data.content && { content_c: data.content }),
          ...(data.score !== undefined && { score_c: data.score })
        }]
      };

      const response = await apperClient.updateRecord(this.tableName, payload);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error('Failed to update comment');
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error('Failed to update comment');
        }

        if (successful.length > 0) {
          const updated = successful[0].data;
          return {
            Id: updated.Id,
            id: updated.Id,
            postId: updated.post_id_c,
            parentId: updated.parent_id_c,
            author: updated.author_c,
            content: updated.content_c,
            timestamp: updated.timestamp_c,
            score: updated.score_c || 0
          };
        }
      }

      throw new Error('Failed to update comment');
    } catch (error) {
      console.error('Error updating comment:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error('ApperClient not initialized');
      }

      // First, delete child comments
      const childComments = await this.getByPostId(id);
      const childIds = childComments.filter(c => c.parentId === parseInt(id)).map(c => c.Id);

      if (childIds.length > 0) {
        await apperClient.deleteRecord(this.tableName, { RecordIds: childIds });
      }

      // Then delete the comment itself
      const response = await apperClient.deleteRecord(this.tableName, {
        RecordIds: [parseInt(id)]
      });

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error?.response?.data?.message || error);
      return false;
    }
  }

  async vote(id, voteType) {
    try {
      const comment = await this.getById(id);
      if (!comment) {
        throw new Error('Comment not found');
      }

      let newScore = comment.score;
      if (voteType === 'up') {
        newScore++;
      } else if (voteType === 'down') {
        newScore--;
      }

      await this.update(id, { score: newScore });

      return { ...comment, score: newScore };
    } catch (error) {
      console.error('Error voting on comment:', error?.response?.data?.message || error);
      throw error;
    }
  }
}

export default new CommentService();