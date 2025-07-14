# Modular API Architecture

This directory contains a modular API client architecture that allows for better organization and maintainability as the project grows.

## Structure

```
src/lib/api/
├── index.ts           # Main export combining all APIs
├── base.ts            # Base API client with common functionality
├── client.ts          # Main API client combining all services
├── types/
│   ├── index.ts       # Export all types
│   ├── video.ts       # Video-related types
│   └── chat.ts        # Chat-related types
└── services/
    ├── video.ts       # Video API service
    └── chat.ts        # Chat API service
```

## Usage

### Option 1: Legacy API (Backward Compatible)
```typescript
import { apiClient } from '@/lib/api';

// Works exactly as before
const video = await apiClient.processVideo(url);
const response = await apiClient.sendChatMessage(request);
```

### Option 2: Modular API (Recommended for new code)
```typescript
import { apiClient } from '@/lib/api';

// Use specific service modules
const video = await apiClient.video.processVideo(url);
const response = await apiClient.chat.sendMessage(request);
```

### Option 3: Direct Service Import
```typescript
import { VideoAPIService, ChatAPIService } from '@/lib/api';

const videoAPI = new VideoAPIService();
const chatAPI = new ChatAPIService();

const video = await videoAPI.processVideo(url);
const response = await chatAPI.sendMessage(request);
```

## Adding New Features

### Adding a new API domain:

1. **Create types**: Add new type file in `types/` directory
2. **Create service**: Add new service class in `services/` directory extending `BaseAPIClient`
3. **Update main client**: Add the service to `APIClient` class in `client.ts`
4. **Export**: Add exports to `index.ts`

### Example: Adding Quiz API

```typescript
// types/quiz.ts
export interface Quiz {
  id: string;
  questions: Question[];
}

// services/quiz.ts
export class QuizAPIService extends BaseAPIClient {
  async createQuiz(videoId: string) {
    return this.makePostRequest('/api/quiz/create', { video_id: videoId });
  }
}

// client.ts - add to APIClient class
public readonly quiz: QuizAPIService;

constructor(baseURL?: string) {
  super(baseURL);
  // ... existing services
  this.quiz = new QuizAPIService(baseURL);
}
```

## Benefits

- **Modular**: Each domain has its own service
- **Maintainable**: Easy to find and modify specific functionality
- **Scalable**: Adding new features doesn't bloat a single file
- **Type-safe**: Strong TypeScript typing throughout
- **Backward Compatible**: Existing code continues to work
- **Testable**: Services can be tested independently 