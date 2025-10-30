import { BaseAPIClient } from '../base';
import {
  QuizGenerateRequest,
  QuizResponse,
  QuizSubmission,
  QuizResult,
  QuizResultResponse,
  QuizStatistics,
  QuizAvailability
} from '../types/quiz';

export class QuizAPIService extends BaseAPIClient {
  /**
   * Generate a new quiz for a video using AI
   */
  async generateQuiz(videoId: string, numQuestions: number = 5): Promise<QuizResponse> {
    const request: QuizGenerateRequest = {
      video_id: videoId,
      num_questions: numQuestions
    };
    
    return this.makePostRequest<QuizResponse>('/api/quiz/generate', request);
  }

  /**
   * Submit quiz answers and get detailed results
   */
  async submitQuiz(submission: QuizSubmission): Promise<QuizResultResponse> {
    return this.makePostRequest<QuizResultResponse>('/api/quiz/submit', submission);
  }

  /**
   * Get quiz attempt history for a specific video
   */
  async getQuizHistory(videoId: string): Promise<QuizResult[]> {
    return this.makeGetRequest<QuizResult[]>(`/api/quiz/history/${videoId}`);
  }

  /**
   * Get comprehensive quiz statistics for the current user
   */
  async getQuizStatistics(): Promise<QuizStatistics> {
    return this.makeGetRequest<QuizStatistics>('/api/quiz/statistics');
  }

  /**
   * Reset all quiz attempts for a specific video
   */
  async resetQuizAttempts(videoId: string): Promise<{ message: string }> {
    return this.makeDeleteRequest<{ message: string }>(`/api/quiz/reset/${videoId}`);
  }

  /**
   * Check if a quiz is available or cached for a video
   */
  async checkQuizAvailability(videoId: string): Promise<QuizAvailability> {
    return this.makeGetRequest<QuizAvailability>(`/api/quiz/check/${videoId}`);
  }

  /**
   * Get existing quiz for a video (must be already generated)
   */
  async getQuiz(videoId: string): Promise<QuizResponse> {
    return this.makeGetRequest<QuizResponse>(`/api/quiz/${videoId}`);
  }

  /**
   * Utility method to calculate quiz score percentage
   */
  calculateScorePercentage(score: number, totalQuestions: number): number {
    if (totalQuestions === 0) return 0;
    return Math.round((score / totalQuestions) * 100);
  }

  /**
   * Utility method to get performance level based on score
   */
  getPerformanceLevel(scorePercentage: number): {
    level: 'excellent' | 'good' | 'fair' | 'needs-improvement';
    message: string;
    color: string;
  } {
    if (scorePercentage >= 90) {
      return {
        level: 'excellent',
        message: 'Excellent! You have mastered this content.',
        color: 'text-green-600'
      };
    } else if (scorePercentage >= 75) {
      return {
        level: 'good',
        message: 'Good job! You understand most of the content.',
        color: 'text-blue-600'
      };
    } else if (scorePercentage >= 60) {
      return {
        level: 'fair',
        message: 'Fair. Consider reviewing the material again.',
        color: 'text-yellow-600'
      };
    } else {
      return {
        level: 'needs-improvement',
        message: 'Keep studying! Review the content and try again.',
        color: 'text-red-600'
      };
    }
  }

  /**
   * Utility method to format time duration
   */
  formatTimeElapsed(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  /**
   * Utility method to validate quiz submission
   */
  validateSubmission(submission: QuizSubmission, expectedQuestions: number): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!submission.video_id) {
      errors.push('Video ID is required');
    }

    if (!submission.answers || submission.answers.length === 0) {
      errors.push('At least one answer is required');
    }

    if (submission.answers && submission.answers.length !== expectedQuestions) {
      errors.push(`Expected ${expectedQuestions} answers, but got ${submission.answers.length}`);
    }

    // Check for duplicate question indices
    if (submission.answers) {
      const indices = submission.answers.map(a => a.question_index);
      const uniqueIndices = new Set(indices);
      if (indices.length !== uniqueIndices.size) {
        errors.push('Duplicate question indices found');
      }

      // Check for missing or invalid answers
      submission.answers.forEach((answer, index) => {
        if (answer.question_index !== index) {
          errors.push(`Answer index mismatch at position ${index}`);
        }
        if (!answer.selected_answer || answer.selected_answer.trim() === '') {
          errors.push(`Answer is required for question ${index + 1}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Utility method to generate quiz summary statistics
   */
  generateQuizSummary(results: QuizResult[]): {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
    improvementTrend: 'improving' | 'declining' | 'stable' | 'insufficient-data';
  } {
    if (results.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        improvementTrend: 'insufficient-data'
      };
    }

    const scores = results.map(r => this.calculateScorePercentage(r.score, r.total_questions));
    const totalAttempts = results.length;
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / totalAttempts;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);

    // Calculate improvement trend (compare first half with second half)
    let improvementTrend: 'improving' | 'declining' | 'stable' | 'insufficient-data' = 'insufficient-data';
    
    if (totalAttempts >= 4) {
      const midPoint = Math.floor(totalAttempts / 2);
      const firstHalf = scores.slice(0, midPoint);
      const secondHalf = scores.slice(midPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
      
      const difference = secondHalfAvg - firstHalfAvg;
      
      if (difference > 5) {
        improvementTrend = 'improving';
      } else if (difference < -5) {
        improvementTrend = 'declining';
      } else {
        improvementTrend = 'stable';
      }
    }

    return {
      totalAttempts,
      averageScore: Math.round(averageScore),
      bestScore,
      worstScore,
      improvementTrend
    };
  }
}
