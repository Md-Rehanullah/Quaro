// Main Application Controller for AnonQ&A Platform
class AnonQAApp {
  constructor() {
    this.storage = new StorageManager();
    this.currentSort = 'trending';
    this.currentCategory = '';
    this.currentQuestionId = null;
    
    this.init();
  }

  // Initialize the application
  init() {
    this.bindEvents();
    this.loadQuestions();
    this.setupMobileNavigation();
    this.trackPageView();
    
    // Load seed data if no questions exist
    if (this.storage.getQuestions().length === 0) {
      this.loadSeedData();
    }
  }

  // Bind all event listeners
  bindEvents() {
    // Navigation events
    document.addEventListener('DOMContentLoaded', () => {
      this.loadQuestions();
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
      categoryFilter.addEventListener('change', (e) => {
        this.currentCategory = e.target.value;
        this.loadQuestions();
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
  loadQuestions() {
    const questionsContainer = document.getElementById('questionsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (!questionsContainer) return;

    const questions = this.storage.getFilteredQuestions(this.currentCategory, this.currentSort);
    
    if (questions.length === 0) {
      questionsContainer.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    questionsContainer.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    questionsContainer.innerHTML = questions.map(question => this.renderQuestion(question)).join('');
    
    // Bind question-specific events
    this.bindQuestionEvents();
  }

  // Render a single question
  renderQuestion(question) {
    const categoryInfo = CategoryUtils.getCategoryInfo(question.category);
    const answers = this.storage.getAnswersByQuestionId(question.id);
    const userVote = this.storage.getUserVote('question', question.id);
    
    return `
      <div class="question-card" data-question-id="${question.id}">
        <div class="question-header">
          <div class="question-meta">
            <span class="category-tag" style="background-color: ${categoryInfo.color}">
              <i class="${categoryInfo.icon}"></i> ${categoryInfo.name}
            </span>
            <span class="question-time">${TimeUtils.getRelativeTime(question.timestamp)}</span>
          </div>
        </div>
        
        <h3 class="question-title">${TextUtils.sanitizeHtml(question.title)}</h3>
        
        ${question.details ? `
          <div class="question-details">
            ${TextUtils.sanitizeHtml(question.details)}
          </div>
        ` : ''}
        
        <div class="question-actions">
          <button class="action-btn vote-btn ${userVote === 'like' ? 'liked' : ''}" 
                  data-action="like" data-question-id="${question.id}">
            <i class="fas fa-thumbs-up"></i> ${question.likes}
          </button>
          
          <button class="action-btn vote-btn ${userVote === 'dislike' ? 'disliked' : ''}" 
                  data-action="dislike" data-question-id="${question.id}">
            <i class="fas fa-thumbs-down"></i> ${question.dislikes}
          </button>
          
          <button class="action-btn answer-btn" data-question-id="${question.id}">
            <i class="fas fa-reply"></i> Answer
          </button>
          
          <button class="action-btn share-btn" data-question-id="${question.id}">
            <i class="fas fa-share"></i> Share
          </button>
          
          <button class="action-btn report-btn" data-question-id="${question.id}" data-type="question">
            <i class="fas fa-flag"></i> Report
          </button>
        </div>
        
        ${answers.length > 0 ? this.renderAnswersSection(question.id, answers) : ''}
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
    const userVote = this.storage.getUserVote('answer', answer.id);
    
    return `
      <div class="answer-card" data-answer-id="${answer.id}">
        <div class="answer-content">
          ${TextUtils.sanitizeHtml(answer.content)}
        </div>
        
        <div class="answer-meta">
          <span class="answer-time">${TimeUtils.getRelativeTime(answer.timestamp)}</span>
          
          <div class="answer-actions">
            <button class="action-btn vote-btn ${userVote === 'like' ? 'liked' : ''}" 
                    data-action="like" data-answer-id="${answer.id}">
              <i class="fas fa-thumbs-up"></i> ${answer.likes}
            </button>
            
            <button class="action-btn vote-btn ${userVote === 'dislike' ? 'disliked' : ''}" 
                    data-action="dislike" data-answer-id="${answer.id}">
              <i class="fas fa-thumbs-down"></i> ${answer.dislikes}
            </button>
            
            <button class="action-btn report-btn" data-answer-id="${answer.id}" data-type="answer">
              <i class="fas fa-flag"></i> Report
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Bind events for questions and answers
  bindQuestionEvents() {
    // Vote buttons
    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleVote(e));
    });

    // Answer buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleAnswerClick(e));
    });

    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleShare(e));
    });

    // Report buttons
    document.querySelectorAll('.report-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleReportClick(e));
    });
  }

  // Handle question form submission
  handleQuestionSubmit(e) {
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
      const question = this.storage.saveQuestion(questionData);
      AnalyticsUtils.trackAction('question_posted', { category: questionData.category });
      
      UIUtils.showToast('Question posted successfully!', 'success');
      this.hideAskModal();
      this.loadQuestions();
      
      // Scroll to the new question
      setTimeout(() => {
        const questionElement = document.querySelector(`[data-question-id="${question.id}"]`);
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
  handleAnswerSubmit(e) {
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
      this.storage.saveAnswer(answerData);
      AnalyticsUtils.trackAction('answer_posted', { questionId: this.currentQuestionId });
      
      UIUtils.showToast('Answer posted successfully!', 'success');
      this.hideAnswerModal();
      this.loadQuestions();
      
    } catch (error) {
      console.error('Error saving answer:', error);
      UIUtils.showToast('Failed to post answer. Please try again.', 'error');
    }
  }

  // Handle report form submission
  handleReportSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reportData = {
      itemType: this.currentReportType,
      itemId: this.currentReportId,
      reason: formData.get('reason'),
      details: formData.get('details')
    };

    if (!reportData.reason) {
      UIUtils.showToast('Please select a reason for reporting.', 'error');
      return;
    }

    try {
      this.storage.saveReport(reportData);
      AnalyticsUtils.trackAction('content_reported', { 
        type: reportData.itemType, 
        reason: reportData.reason 
      });
      
      UIUtils.showToast('Content reported successfully. Thank you for helping maintain our community.', 'success');
      this.hideReportModal();
      
    } catch (error) {
      console.error('Error saving report:', error);
      UIUtils.showToast('Failed to submit report. Please try again.', 'error');
    }
  }

  // Handle voting
  handleVote(e) {
    const btn = e.currentTarget;
    const action = btn.dataset.action; // 'like' or 'dislike'
    const questionId = btn.dataset.questionId;
    const answerId = btn.dataset.answerId;

    const hideLoading = UIUtils.showLoading(btn);

    try {
      let result;
      if (questionId) {
        result = this.storage.voteOnQuestion(questionId, action);
        AnalyticsUtils.trackAction('question_voted', { questionId, action });
      } else if (answerId) {
        result = this.storage.voteOnAnswer(answerId, action);
        AnalyticsUtils.trackAction('answer_voted', { answerId, action });
      }

      if (result) {
        this.loadQuestions();
        UIUtils.showToast('Vote recorded!', 'success', 1500);
      }
      
    } catch (error) {
      console.error('Error voting:', error);
      UIUtils.showToast('Failed to record vote. Please try again.', 'error');
    } finally {
      hideLoading();
    }
  }

  // Handle answer button click
  handleAnswerClick(e) {
    const questionId = e.currentTarget.dataset.questionId;
    const question = this.storage.getQuestionById(questionId);
    
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
    const question = this.storage.getQuestionById(questionId);
    
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
  switchTab(tabBtn, sortType) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    tabBtn.classList.add('active');
    
    this.currentSort = sortType;
    this.loadQuestions();
    
    AnalyticsUtils.trackAction('tab_switched', { sortType });
  }

  // Filter questions by category
  filterQuestions() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      this.currentCategory = categoryFilter.value;
      this.loadQuestions();
      
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

  // Load seed data for demonstration
  loadSeedData() {
    const seedQuestions = [
      {
        title: "What are the best practices for learning JavaScript in 2024?",
        details: "I'm a beginner looking to learn JavaScript effectively. What resources, methods, and projects would you recommend for someone starting out?",
        category: "technology"
      },
      {
        title: "How can I maintain work-life balance while working remotely?",
        details: "Since switching to remote work, I'm struggling to separate my personal and professional life. Any tips?",
        category: "lifestyle"
      },
      {
        title: "What are some effective study techniques for retaining information?",
        details: "I'm preparing for important exams and want to optimize my study sessions. What methods have worked best for you?",
        category: "education"
      }
    ];

    seedQuestions.forEach(questionData => {
      const question = this.storage.saveQuestion(questionData);
      
      // Add some sample answers
      if (Math.random() > 0.5) {
        this.storage.saveAnswer({
          questionId: question.id,
          content: "Great question! Here's what has worked for me..."
        });
      }
    });

    this.loadQuestions();
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
  // Could implement auto-backup functionality here
  const stats = window.app ? window.app.storage.getStats() : null;
  if (stats && stats.totalQuestions > 10) {
    // Optional: warn users with significant data
    // e.returnValue = 'You have questions and answers stored locally. Are you sure you want to leave?';
  }
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
  UIUtils.showToast('You are offline. Your data is saved locally.', 'info', 3000);
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnonQAApp;
}
