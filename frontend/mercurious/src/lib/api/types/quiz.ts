export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuizGenerateRequest {
  video_id: string;
  num_questions?: number;
}

export interface QuizResponse {
  questions: QuizQuestion[];
  video_id: string;
  generated_at: string;
}

export interface QuizAnswer {
  question_index: number;
  selected_answer: string;
}

export interface QuizSubmission {
  video_id: string;
  answers: QuizAnswer[];
}

export interface QuizResult {
  video_id: string;
  score: number;
  total_questions: number;
  correct_answers: number[];
  submitted_at: string;
  time_taken: number;
}

export interface QuizResultResponse {
  result: QuizResult;
  questions: QuizQuestion[];
}

export interface QuizStatistics {
  total_videos_with_quizzes: number;
  total_quiz_attempts: number;
  overall_average_score: number;
  best_overall_score: number;
  completion_rate: number;
}

export interface QuizAvailability {
  video_id: string;
  quiz_available: boolean;
  quiz_fresh: boolean;
  generated_at: string | null;
}

// UI-specific types for better user experience
export interface QuizState {
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  timeStarted: Date | null;
  timeElapsed: number;
  isSubmitted: boolean;
  result: QuizResultResponse | null;
}

export interface QuizProgress {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  percentComplete: number;
}

// Error types for better error handling
export interface QuizError {
  type: 'generation' | 'submission' | 'loading' | 'network';
  message: string;
  details?: string;
}
