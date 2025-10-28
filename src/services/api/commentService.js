import commentsData from "@/services/mockData/comments.json";

class CommentService {
  constructor() {
    this.storageKey = 'threadspace_comments';
    this.comments = this.loadComments();
  }

  loadComments() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading comments from localStorage:', error);
    }
    return commentsData || [];
  }

  saveComments() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.comments));
    } catch (error) {
      console.error('Error saving comments to localStorage:', error);
    }
  }

  async getByPostId(postId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const postComments = this.comments.filter(c => c.postId === parseInt(postId));
    return postComments.map(c => ({ ...c }));
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const comment = this.comments.find(c => c.id === parseInt(id));
    if (!comment) {
      throw new Error('Comment not found');
    }
    return { ...comment };
  }

async create(commentData) {
    if (!commentData.author) {
      throw new Error('Author is required');
    }

    const newComment = {
      id: Math.max(0, ...this.comments.map(c => c.id)) + 1,
      postId: parseInt(commentData.postId),
      parentId: commentData.parentId ? parseInt(commentData.parentId) : null,
      author: commentData.author,
      content: commentData.content.trim(),
      timestamp: new Date().toISOString(),
      score: 0
    };

    this.comments.push(newComment);
    this.saveComments();
    return { ...newComment };
  }

  async update(id, data) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = this.comments.findIndex(c => c.id === parseInt(id));
    if (index === -1) {
      throw new Error('Comment not found');
    }
    this.comments[index] = { ...this.comments[index], ...data };
    this.saveComments();
    return { ...this.comments[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Delete child comments
    this.comments = this.comments.filter(c => c.parentId !== parseInt(id));

    // Delete the comment itself
    this.comments = this.comments.filter(c => c.id !== parseInt(id));
    
    this.saveComments();
  }

  async vote(id, voteType) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const comment = this.comments.find(c => c.id === parseInt(id));
    
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (voteType === 'up') {
      comment.score++;
    } else if (voteType === 'down') {
      comment.score--;
    }

    this.saveComments();
    return { ...comment };
  }
}

export default new CommentService();