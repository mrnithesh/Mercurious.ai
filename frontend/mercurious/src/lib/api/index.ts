// Export all types
export * from './types';

// Export services for direct use
export { VideoAPIService } from './services/video';
export { ChatAPIService } from './services/chat';
export { BaseAPIClient } from './base';

// Export main client
export { APIClient } from './client';

// Import APIClient to create instance
import { APIClient } from './client';

// Create and export default client instance for backward compatibility
export const apiClient = new APIClient();

// Legacy exports - these maintain backward compatibility
export const processVideo = apiClient.processVideo.bind(apiClient);
export const isValidYouTubeUrl = apiClient.isValidYouTubeUrl.bind(apiClient);
export const sendChatMessage = apiClient.sendChatMessage.bind(apiClient);
export const getChatHistory = apiClient.getChatHistory.bind(apiClient);
export const clearChatHistory = apiClient.clearChatHistory.bind(apiClient);
export const setVideoContext = apiClient.setVideoContext.bind(apiClient);
export const checkHealth = apiClient.checkHealth.bind(apiClient); 