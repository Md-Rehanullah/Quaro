// API layer for communication with backend server
// Handles all HTTP requests to the backend API

// API configuration
const API_CONFIG = {
  // Base URL for API - adjust for deployment environment
  // For local development: 'http://localhost:5000'
  // For production: replace with actual backend URL
  BASE_URL: 'https://quaro-1.onrender.com', // <-- UPDATED HERE
  ENDPOINTS: {
    QUESTIONS: '/api/questions',
    REPORT: '/api/report',
  },
  // Enable mock mode for development/testing when API is not available
  USE_MOCK_DATA: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
};

/**
 * API utility functions for making HTTP requests
 */
class API {
  /**
   * Makes a GET request to the specified endpoint
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  static async get(endpoint) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API GET request failed:', error);
      throw error;
    }
  }

  /**
   * Makes a POST request to the specified endpoint
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request payload
   * @returns {Promise<any>} Response data
   */
  static async post(endpoint, data) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST request failed:', error);
      throw error;
    }
  }
}

/**
 * Question-related API functions
 */
class QuestionAPI {
  /**
   * Fetches all questions from the backend
   * @returns {Promise<Array>} Array of questions
   */
  static async getAllQuestions() {
    if (API_CONFIG.USE_MOCK_DATA) {
      // Import and use mock data for development
      const { MOCK_API } = await import('./mock-data.js');
      return await MOCK_API.getAllQuestions();
    }
    return await API.get(API_CONFIG.ENDPOINTS.QUESTIONS);
  }

  /**
   * Fetches a single question by ID
   * @param {string} questionId - Question ID
   * @returns {Promise<object>} Question object
   */
  static async getQuestionById(questionId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      const { MOCK_API } = await import('./mock-data.js');
      return MOCK_API.questions.find(q => q._id === questionId) || null;
    }
    return await API.get(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${questionId}`);
  }

  /**
   * Creates a new question
   * @param {object} questionData - Question data (title, details, category)
   * @returns {Promise<object>} Created question
   */
  static async createQuestion(questionData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      const { MOCK_API } = await import('./mock-data.js');
      const newQuestion = {
        _id: 'mock_' + Date.now(),
        title: questionData.title,
        details: questionData.details || '',
        createdAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
        answers: []
      };
      MOCK_API.questions.unshift(newQuestion);
      return newQuestion;
    }
    
    // Map frontend data to backend format
    const backendData = {
      title: questionData.title,
      details: questionData.details || '',
    };
    
    return await API.post(API_CONFIG.ENDPOINTS.QUESTIONS, backendData);
  }

  /**
   * Adds an answer to a question
   * @param {string} questionId - Question ID
   * @param {object} answerData - Answer data (content)
   * @returns {Promise<object>} Updated question with new answer
   */
  static async addAnswer(questionId, answerData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      const { MOCK_API } = await import('./mock-data.js');
      const question = MOCK_API.questions.find(q => q._id === questionId);
      if (question) {
        const newAnswer = {
          _id: 'mock_answer_' + Date.now(),
          text: answerData.content,
          createdAt: new Date().toISOString(),
          likes: 0,
          dislikes: 0
        };
        question.answers.push(newAnswer);
        return question;
      }
      throw new Error('Question not found');
    }
    
    // Map frontend data to backend format
    const backendData = {
      text: answerData.content,
    };
    
    return await API.post(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${questionId}/answers`, backendData);
  }

  /**
   * Filters and sorts questions on the client side
   * Since the backend doesn't support filtering/sorting yet, we'll do it client-side
   * @param {Array} questions - Array of questions
   * @param {string} category - Category filter (empty string for all)
   * @param {string} sortBy - Sort method ('trending', 'latest')
   * @returns {Array} Filtered and sorted questions
   */
  static filterAndSortQuestions(questions, category = '', sortBy = 'trending') {
    let filtered = questions;

    // Apply category filter
    if (category) {
      // Since backend doesn't store category, we'll skip filtering for now
      // This could be enhanced later when backend supports categories
    }

    // Apply sorting
    switch (sortBy) {
      case 'latest':
        filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'trending':
      default:
        // Sort by answer count (descending) then by creation date (descending)
        filtered = filtered.sort((a, b) => {
          const aAnswerCount = a.answers ? a.answers.length : 0;
          const bAnswerCount = b.answers ? b.answers.length : 0;
          
          if (aAnswerCount !== bAnswerCount) {
            return bAnswerCount - aAnswerCount;
          }
          
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        break;
    }

    return filtered;
  }

  /**
   * Likes a question
   * @param {string} questionId - Question ID
   * @returns {Promise<object>} Updated vote counts
   */
  static async likeQuestion(questionId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      const { MOCK_API } = await import('./mock-data.js');
      return await MOCK_API.likeQuestion(questionId);
    }
    return await API.post(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${questionId}/like`);
  }

  /**
   * Dislikes a question
   * @param {string} questionId - Question ID
   * @returns {Promise<object>} Updated vote counts
   */
  static async dislikeQuestion(questionId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      const { MOCK_API } = await import('./mock-data.js');
      return await MOCK_API.dislikeQuestion(questionId);
    }
    return await API.post(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${questionId}/dislike`);
  }

  /**
   * Likes an answer
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {Promise<object>} Updated vote counts
   */
  static async likeAnswer(questionId, answerId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      const { MOCK_API } = await import('./mock-data.js');
      return await MOCK_API.likeAnswer(questionId, answerId);
    }
    return await API.post(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${questionId}/answers/${answerId}/like`);
  }

  /**
   * Dislikes an answer
   * @param {string} questionId - Question ID
   * @param {string} answerId - Answer ID
   * @returns {Promise<object>} Updated vote counts
   */
  static async dislikeAnswer(questionId, answerId) {
    if (API_CONFIG.USE_MOCK_DATA) {
      const { MOCK_API } = await import('./mock-data.js');
      return await MOCK_API.dislikeAnswer(questionId, answerId);
    }
    return await API.post(`${API_CONFIG.ENDPOINTS.QUESTIONS}/${questionId}/answers/${answerId}/dislike`);
  }

  /**
   * Submits a report for inappropriate content
   * @param {object} reportData - Report data (type, id, reason, details)
   * @returns {Promise<object>} Report submission response
   */
  static async submitReport(reportData) {
    if (API_CONFIG.USE_MOCK_DATA) {
      const { MOCK_API } = await import('./mock-data.js');
      return await MOCK_API.submitReport(reportData);
    }
    return await API.post(API_CONFIG.ENDPOINTS.REPORT, reportData);
  }
}

// Export for use in other modules
export { API, QuestionAPI, API_CONFIG };
