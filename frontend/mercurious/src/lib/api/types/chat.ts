export interface ChatMessage {
  role: string;
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  video_id: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export interface ChatHistory {
  video_id: string;
  messages: ChatMessage[];
} 