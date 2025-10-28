import { UserService } from '@/services/api/userService';

const STORAGE_KEY = 'threadspace_auth';

export const AuthService = {
  login(username, password) {
    // Mock authentication - check if user exists
    const user = UserService.getByUsername(username);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Mock password validation (in real app, this would be server-side)
    // For demo, accept any password for existing users
    if (!password || password.length < 6) {
      throw new Error('Invalid password');
    }
    
    // Create session token (mock JWT)
    const token = btoa(JSON.stringify({
      userId: user.Id,
      username: user.username,
      timestamp: Date.now()
    }));
    
    // Store in localStorage
    const authData = {
      token,
      user: {
        Id: user.Id,
        username: user.username,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        joinDate: user.joinDate
      }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
    
    return authData;
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  },

  getCurrentUser() {
    try {
      const authData = localStorage.getItem(STORAGE_KEY);
      if (!authData) return null;
      
      const parsed = JSON.parse(authData);
      
      // Validate token hasn't expired (24 hours)
      const tokenData = JSON.parse(atob(parsed.token));
      const tokenAge = Date.now() - tokenData.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > maxAge) {
        this.logout();
        return null;
      }
      
      return parsed.user;
    } catch (error) {
      console.error('Error getting current user:', error);
      this.logout();
      return null;
    }
  },

  isAuthenticated() {
    return this.getCurrentUser() !== null;
  },

  getToken() {
    try {
      const authData = localStorage.getItem(STORAGE_KEY);
      if (!authData) return null;
      
      const parsed = JSON.parse(authData);
      return parsed.token;
    } catch (error) {
      return null;
    }
  }
};