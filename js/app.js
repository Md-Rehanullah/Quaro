// Main Application Controller for AnonQ&A Platform
// Import API functions for backend communication
import { QuestionAPI } from './api.js';

class AnonQAApp {
  constructor() {
    // Replace StorageManager with API-based data management
    this.api = QuestionAPI;
    this.currentSort = 'trending';
    this.currentCategory = '';
    this.currentQuestionId = null;
    this.questions = []; // Cache questions locally for UI operations
    
    this.init();
  }

  // Initialize the application
  async init() {
    this.bindEvents();
    await this.loadQuestions(); // Load questions from backend API
    this.setupMobileNavigation();
    this.trackPageView();
  }

  // Bind all event listeners
  bindEvents() {
    // Navigation events
    document.addEventListener('DOMContentLoaded', async () => {
      await this.loadQuestions();
    });

    // Question form submission
    const questionForm = document.getElementById('questionForm');
    if (questionForm) {
      questionForm.addEventListener('submit', (e) => this.handleQuestionSubmit(e));
    }

    // Answer form submission
    const answerForm = document.getElementById('answerForm');
    if (answerForm) {
      answerForm.addEventListener('submit', (e) => this.handleAnswerSubmit(e));
    }

    // Report form submission
    const reportForm = document.getElementById('reportForm');
    if (reportForm) {
      reportForm.addEventListener('submit', (e) => this.handleReportSubmit(e));
    }

    // Filter and sort events
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', async (e) => {
        this.currentCategory = e.target.value;
        await this.loadQuestions();
      });
    }

    // Modal close events
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.hideAllModals();
      }
    });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideAllModals();
      }
    });
  }

  // Setup mobile navigation
  setupMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
      });

      // Close mobile menu when clicking on links
      navMenu.addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-link')) {
          navMenu.classList.remove('active');
          navToggle.classList.remove('active');
        }
      });
    }
  }

  // Track page view for analytics
  trackPageView() {
    const page = window.location.pathname || '/';
    AnalyticsUtils.trackPageView(page);
  }

  // Load and display questions
  // Load and display questions from backend API
  async loadQuestions() {
    const questionsContainer = document.getElementById('questionsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!questionsContainer) return;

    try {
      // Show loading state
      questionsContainer.innerHTML = '<div class="loading">Loading questions...</div>';
      
      // Fetch questions from backend API
      const allQuestions = await this.api.getAllQuestions();
      
      // Filter and sort questions
      this.questions = this.api.filterAndSortQuestions(allQuestions, this.currentCategory, this.currentSort);
      
      if (this.questions.length === 0) {
        questionsContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      questionsContainer.style.display = 'block';
      if (emptyState) emptyState.style.display = 'none';
      
      questionsContainer.innerHTML = this.questions.map(question => this.renderQuestion(question)).join('');
      
      // Bind question-specific events
      this.bindQuestionEvents();
      
    } catch (error) {
      console.error('Error loading questions:', error);
      questionsContainer.innerHTML = '<div class="error">Failed to load questions. Please refresh the page.</div>';
      UIUtils.showToast('Failed to load questions. Please check your connection.', 'error');
    }
  }

  // Render a single question
  renderQuestion(question) {
    // Backend uses different field names, map them appropriately
    const questionId = question._id;
    const answers = question.answers || [];
    
    // Since backend doesn't store category, use a default one
    const categoryInfo = CategoryUtils.getCategoryInfo('general');
    
    // Backend doesn't store voting data, so we'll disable votes for now
    // This could be enhanced later with a proper voting system
    const userVote = null;
    
    return `
      <div class="question-card" data-question-id="${questionId}">
        <div class="question-header">
          <div class="question-meta">
            <span class="category-tag" style="background-color: ${categoryInfo.color}">
              <i class="${categoryInfo.icon}"></i> ${categoryInfo.name}
            </span>
            <span class="question-time">${TimeUtils.getRelativeTime(question.createdAt)}</span>
          </div>
        </div>
        
        <h3 class="question-title">${TextUtils.sanitizeHtml(question.title)}</h3>
        
        ${question.details ? `
          <div class="question-details">
            ${TextUtils.sanitizeHtml(question.details)}
          </div>
        ` : ''}
        
        <div class="question-actions">
          <!-- Voting disabled for now since backend doesn't support it -->
          <span class="action-info">
            <i class="fas fa-comments"></i> ${answers.length} Answer${answers.length !== 1 ? 's' : ''}
          </span>
          
          <button class="action-btn answer-btn" data-question-id="${questionId}">
            <i class="fas fa-reply"></i> Answer
          </button>
          
          <button class="action-btn share-btn" data-question-id="${questionId}">
            <i class="fas fa-share"></i> Share
          </button>
          
          <!-- Reporting disabled for now since backend doesn't support it -->
        </div>
        
        ${answers.length > 0 ? this.renderAnswersSection(questionId, answers) : ''}
      </div>
    `;
  }

  // Render answers section for a question
  renderAnswersSection(questionId, answers) {
    return `
      <div class="answers-section">
        <div class="answers-header">
          <span class="answers-count">${answers.length} Answer${answers.length !== 1 ? 's' : ''}</span>
        </div>
        
        <div class="answers-container">
          ${answers.map(answer => this.renderAnswer(answer)).join('')}
        </div>
      </div>
    `;
  }

  // Render a single answer
  renderAnswer(answer) {
    // Backend answer format uses _id and different field names
    const answerId = answer._id;
    
    return `
      <div class="answer-card" data-answer-id="${answerId}">
        <div class="answer-content">
          ${TextUtils.sanitizeHtml(answer.text)}
        </div>
        
        <div class="answer-meta">
          <span class="answer-time">${TimeUtils.getRelativeTime(answer.createdAt)}</span>
          
          <!-- Answer voting and reporting disabled for now since backend doesn't support it -->
        </div>
      </div>
    `;
  }

  // Bind events for questions and answers
  bindQuestionEvents() {
    // Answer buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleAnswerClick(e));
    });

    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleShare(e));
    });

    // Note: Vote and report buttons are disabled since backend doesn't support them yet
  }

  // Handle question form submission
  // Handle question form submission
  async handleQuestionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const questionData = {
      title: formData.get('title'),
      details: formData.get('details'),
      category: formData.get('category')
    };

    // Validate question data
    const validation = ValidationUtils.validateQuestion(questionData);
    if (!validation.isValid) {
      UIUtils.showToast(validation.errors[0], 'error');
      return;
    }

    // Check for inappropriate content
    const contentCheck = ValidationUtils.checkContent(questionData.title + ' ' + (questionData.details || ''));
    if (!contentCheck.isClean) {
      UIUtils.showToast('Please review your content and remove any inappropriate language.', 'warning');
      return;
    }

    try {
      // Save question to backend API
      const question = await this.api.createQuestion(questionData);
      AnalyticsUtils.trackAction('question_posted', { category: questionData.category });
      
      UIUtils.showToast('Question posted successfully!', 'success');
      this.hideAskModal();
      await this.loadQuestions(); // Reload questions from backend
      
      // Scroll to the new question
      setTimeout(() => {
        const questionElement = document.querySelector(`[data-question-id="${question._id}"]`);
        if (questionElement) {
          UIUtils.scrollToElement(questionElement, 100);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error saving question:', error);
      UIUtils.showToast('Failed to post question. Please try again.', 'error');
    }
  }

  // Handle answer form submission
  async handleAnswerSubmit(e) {
    e.preventDefault();
    
    if (!this.currentQuestionId) {
      UIUtils.showToast('No question selected', 'error');
      return;
    }

    const formData = new FormData(e.target);
    const answerData = {
      questionId: this.currentQuestionId,
      content: formData.get('answer')
    };

    // Validate answer data
    const validation = ValidationUtils.validateAnswer(answerData);
    if (!validation.isValid) {
      UIUtils.showToast(validation.errors[0], 'error');
      return;
    }

    // Check for inappropriate content
    const contentCheck = ValidationUtils.checkContent(answerData.content);
    if (!contentCheck.isClean) {
      UIUtils.showToast('Please review your content and remove any inappropriate language.', 'warning');
      return;
    }

    try {
      // Save answer to backend API
      await this.api.addAnswer(this.currentQuestionId, answerData);
      AnalyticsUtils.trackAction('answer_posted', { questionId: this.currentQuestionId });
      
      UIUtils.showToast('Answer posted successfully!', 'success');
      this.hideAnswerModal();
      await this.loadQuestions(); // Reload questions from backend
      
    } catch (error) {
      console.error('Error saving answer:', error);
      UIUtils.showToast('Failed to post answer. Please try again.', 'error');
    }
  }

  // Handle report form submission (disabled - backend doesn't support reporting yet)
  handleReportSubmit(e) {
    e.preventDefault();
    UIUtils.showToast('Reporting feature is not available yet.', 'info');
    this.hideReportModal();
  }

  // Handle voting (disabled - backend doesn't support voting yet)
  handleVote(e) {
    e.preventDefault();
    UIUtils.showToast('Voting feature is not available yet.', 'info');
  }

  // Handle answer button click
  handleAnswerClick(e) {
    const questionId = e.currentTarget.dataset.questionId;
    
    // Find question in our cached questions array
    const question = this.questions.find(q => q._id === questionId);
    
    if (!question) {
      UIUtils.showToast('Question not found', 'error');
      return;
    }

    this.currentQuestionId = questionId;
    this.showAnswerModal(question);
    
    AnalyticsUtils.trackAction('answer_modal_opened', { questionId });
  }

  // Handle share button click
  handleShare(e) {
    const questionId = e.currentTarget.dataset.questionId;
    
    // Find question in our cached questions array
    const question = this.questions.find(q => q._id === questionId);
    
    if (!question) {
      UIUtils.showToast('Question not found', 'error');
      return;
    }

    ShareUtils.shareQuestion(question);
    AnalyticsUtils.trackAction('question_shared', { questionId });
  }

  // Handle report button click
  handleReportClick(e) {
    const btn = e.currentTarget;
    const type = btn.dataset.type; // 'question' or 'answer'
    const id = btn.dataset.questionId || btn.dataset.answerId;
    
    this.currentReportType = type;
    this.currentReportId = id;
    this.showReportModal();
    
    AnalyticsUtils.trackAction('report_modal_opened', { type, id });
  }

  // Switch between trending and latest tabs
  async switchTab(tabBtn, sortType) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    tabBtn.classList.add('active');
    
    this.currentSort = sortType;
    await this.loadQuestions();
    
    AnalyticsUtils.trackAction('tab_switched', { sortType });
  }

  // Filter questions by category
  async filterQuestions() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      this.currentCategory = categoryFilter.value;
      await this.loadQuestions();
      
      AnalyticsUtils.trackAction('questions_filtered', { category: this.currentCategory });
    }
  }

  // Modal management
  showAskModal() {
    const modal = document.getElementById('askModal');
    if (modal) {
      modal.style.display = 'block';
      const titleInput = document.getElementById('questionTitle');
      if (titleInput) {
        setTimeout(() => titleInput.focus(), 100);
      }
    }
  }

  hideAskModal() {
    const modal = document.getElementById('askModal');
    const form = document.getElementById('questionForm');
    if (modal) {
      modal.style.display = 'none';
    }
    if (form) {
      form.reset();
    }
  }

  showAnswerModal(question) {
    const modal = document.getElementById('answerModal');
    const titleElement = document.getElementById('answerQuestionTitle');
    
    if (modal && titleElement) {
      titleElement.textContent = question.title;
      modal.style.display = 'block';
      
      const answerInput = document.getElementById('answerText');
      if (answerInput) {
        setTimeout(() => answerInput.focus(), 100);
      }
    }
  }

  hideAnswerModal() {
    const modal = document.getElementById('answerModal');
    const form = document.getElementById('answerForm');
    if (modal) {
      modal.style.display = 'none';
    }
    if (form) {
      form.reset();
    }
    this.currentQuestionId = null;
  }

  showReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) {
      modal.style.display = 'block';
      const reasonSelect = document.getElementById('reportReason');
      if (reasonSelect) {
        setTimeout(() => reasonSelect.focus(), 100);
      }
    }
  }

  hideReportModal() {
    const modal = document.getElementById('reportModal');
    const form = document.getElementById('reportForm');
    if (modal) {
      modal.style.display = 'none';
    }
    if (form) {
      form.reset();
    }
    this.currentReportType = null;
    this.currentReportId = null;
  }

  hideAllModals() {
    this.hideAskModal();
    this.hideAnswerModal();
    this.hideReportModal();
  }

}

// Global functions for HTML event handlers
window.showAskModal = function() {
  window.app.showAskModal();
};

window.hideAskModal = function() {
  window.app.hideAskModal();
};

window.hideAnswerModal = function() {
  window.app.hideAnswerModal();
};

window.hideReportModal = function() {
  window.app.hideReportModal();
};

window.switchTab = function(tabBtn, sortType) {
  window.app.switchTab(tabBtn, sortType);
};

window.filterQuestions = function() {
  window.app.filterQuestions();
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.app = new AnonQAApp();
});

// Handle page visibility changes for analytics
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // Page became visible
    AnalyticsUtils.trackAction('page_focus');
  }
});

// Handle before unload for potential data backup
window.addEventListener('beforeunload', function(e) {
  // Auto-backup functionality removed since we're using backend API now
  // Could implement auto-sync or warn about unsaved data here if needed
});

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    // Could register a service worker for offline functionality
    console.log('Service worker support detected');
  });
}

// Handle online/offline status
window.addEventListener('online', function() {
  UIUtils.showToast('Connection restored', 'success', 2000);
});

window.addEventListener('offline', function() {
  UIUtils.showToast('You are offline. Some features may not work.', 'warning', 3000);
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnonQAApp;
}
