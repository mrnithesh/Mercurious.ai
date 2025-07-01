// Simple API client for existing video processing endpoint
class APIClient {
    constructor() {
        this.baseURL = 'http://localhost:8000';
    }

    async processVideo(videoUrl) {
        const response = await fetch(`${this.baseURL}/api/videos/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: videoUrl })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    isValidYouTubeUrl(url) {
        return /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/.test(url);
    }
}

window.apiClient = new APIClient();
