export const AuthService = {
  getCurrentUser() {
    // User data is now managed by ApperUI and Redux
    // This method is maintained for backward compatibility
    return null;
  },

  isAuthenticated() {
    // Authentication is now handled by ApperUI
    return false;
  },

  getToken() {
    // Token management is handled by ApperUI
    return null;
  }
};