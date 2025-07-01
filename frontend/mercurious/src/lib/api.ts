// API client for video processing backend
export interface VideoInfo {
  title: string;
  author: string;
  description: string;
  duration: string;
  thumbnail_url: string;
  publish_date: string;
  views: number;
  likes: number;
  video_url: string;
}

export interface VideoContent {
  transcript: string;
  summary: string;
  main_points: string[];
  key_concepts: string[];
  study_guide: string;
  analysis: string;
  vocabulary: string[];
}

export interface VideoResponse {
  video_id: string;
  info: VideoInfo;
  content: VideoContent;
  progress: number;
  created_at: string;
  last_watched?: string;
}

export interface APIError {
  detail: string;
}

class APIClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  async processVideo(videoUrl: string): Promise<VideoResponse> {
    const response = await fetch(`${this.baseURL}/api/videos/process`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url: videoUrl })
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const error: APIError = await response.json();
        errorMessage = error.detail || errorMessage;
      } catch {
        // If JSON parsing fails, use the default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  isValidYouTubeUrl(url: string): boolean {
    return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/.test(url);
  }

  async checkHealth(): Promise<{ status: string; service: string; message: string }> {
    const response = await fetch(`${this.baseURL}/api/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: HTTP ${response.status}`);
    }
    return response.json();
  }
}

export const apiClient = new APIClient(); 