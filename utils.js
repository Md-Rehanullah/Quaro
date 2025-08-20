// Utility functions for AnonQ&A Platform

// Time formatting utilities
const TimeUtils = {
  // Format timestamp to relative time (e.g., "2 hours ago")
  getRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return time.toLocaleDateString();
    }
  },

  // Format timestamp to readable date
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

// Text processing utilities
const TextUtils = {
  // Truncate text to specified length
  truncate(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  },

  // Basic HTML sanitization
  sanitizeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Convert URLs to clickable links
  linkify(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  },

  // Highlight search terms
  highlight(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }
};

// Category utilities
const CategoryUtils = {
  // Get category display name and icon
  getCategoryInfo(category) {
    const categories = {
      technology: { name: 'Technology', icon: 'fas fa-laptop-code', color: '#3b82f6' },
      science: { name: 'Science', icon: 'fas fa-flask', color: '#10b981' },
      education: { name: 'Education', icon: 'fas fa-graduation-cap', color: '#f59e0b' },
      health: { name: 'Health', icon: 'fas fa-heartbeat', color: '#ef4444' },
      lifestyle: { name: 'Lifestyle', icon: 'fas fa-leaf', color: '#8b5cf6' },
      business: { name: 'Business', icon: 'fas fa-briefcase', color: '#06b6d4' },
      general: { name: 'General', icon: 'fas fa-comments', color: '#64748b' }
    };
    
    return categories[category] || categories.general;
  },

  // Get all available categories
  getAllCategories() {
    return [
      { value: 'technology', name: 'Technology' },
      { value: 'science', name: 'Science' },
      { value: 'education', name: 'Education' },
      { value: 'health', name: 'Health' },
      { value: 'lifestyle', name: 'Lifestyle' },
      { value: 'business', name: 'Business' },
      { value: 'general', name: 'General' }
    ];
  }
};

// Validation utilities
const ValidationUtils = {
  // Validate question data
  validateQuestion(data) {
    const errors = [];
    
    if (!data.title || data.title.trim().length === 0) {
      errors.push('Question title is required');
    } else if (data.title.length > 200) {
      errors.push('Question title must be less than 200 characters');
    }
    
    if (!data.category) {
      errors.push('Category is required');
    }
    
    if (data.details && data.details.length > 1000) {
      errors.push('Question details must be less than 1000 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate answer data
  validateAnswer(data) {
    const errors = [];
    
    if (!data.content || data.content.trim().length === 0) {
      errors.push('Answer content is required');
    } else if (data.content.length > 2000) {
      errors.push('Answer must be less than 2000 characters');
    }
    
    if (!data.questionId) {
      errors.push('Question ID is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Validate email
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Check for inappropriate content (basic)
  checkContent(text) {
    // Basic inappropriate content detection
    const inappropriateWords = [
      // Add inappropriate words here
    ];
    
    const lowerText = text.toLowerCase();
    const foundWords = inappropriateWords.filter(word => 
      lowerText.includes(word.toLowerCase())
    );
    
    return {
      isClean: foundWords.length === 0,
      foundWords
    };
  }
};

// UI utilities
const UIUtils = {
  // Show notification toast
  showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${this.getToastIcon(type)}"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('toast-show'), 100);
    
    // Hide toast
    setTimeout(() => {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  getToastIcon(type) {
    const icons = {
      info: 'info-circle',
      success: 'check-circle',
      warning: 'exclamation-triangle',
      error: 'times-circle'
    };
    return icons[type] || icons.info;
  },

  // Show loading spinner
  showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    element.disabled = true;
    
    return () => {
      element.innerHTML = originalContent;
      element.disabled = false;
    };
  },

  // Animate element
  animate(element, animation = 'fadeIn', duration = 300) {
    element.style.animation = `${animation} ${duration}ms ease-in-out`;
    
    return new Promise(resolve => {
      setTimeout(() => {
        element.style.animation = '';
        resolve();
      }, duration);
    });
  },

  // Scroll to element
  scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  },

  // Copy text to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard!', 'success');
      return true;
    } catch (error) {
      console.error('Failed to copy text:', error);
      this.showToast('Failed to copy text', 'error');
      return false;
    }
  }
};

// Share utilities
const ShareUtils = {
  // Share question
  shareQuestion(question) {
    const url = window.location.origin + window.location.pathname + `#question-${question.id}`;
    const text = `Check out this question: "${question.title}"`;
    
    if (navigator.share) {
      navigator.share({
        title: question.title,
        text: text,
        url: url
      }).catch(error => console.error('Error sharing:', error));
    } else {
      this.fallbackShare(text, url);
    }
  },

  // Fallback share options
  fallbackShare(text, url) {
    const shareUrl = encodeURIComponent(url);
    const shareText = encodeURIComponent(text);
    
    const shareOptions = [
      {
        name: 'Twitter',
        url: `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
        icon: 'fab fa-twitter'
      },
      {
        name: 'Facebook',
        url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
        icon: 'fab fa-facebook'
      },
      {
        name: 'LinkedIn',
        url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
        icon: 'fab fa-linkedin'
      },
      {
        name: 'Copy Link',
        action: () => UIUtils.copyToClipboard(url),
        icon: 'fas fa-link'
      }
    ];
    
    this.showShareModal(shareOptions);
  },

  // Show share modal
  showShareModal(options) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Share</h2>
          <span class="close">&times;</span>
        </div>
        <div class="modal-body">
          <div class="share-options">
            ${options.map(option => `
              <a href="${option.url || '#'}" 
                 class="share-option" 
                 ${option.url ? 'target="_blank"' : ''}
                 data-action="${option.name}">
                <i class="${option.icon}"></i>
                ${option.name}
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle close
    modal.querySelector('.close').addEventListener('click', () => {
      modal.remove();
    });
    
    // Handle share options
    modal.querySelectorAll('.share-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        if (action === 'Copy Link') {
          e.preventDefault();
          const copyOption = options.find(opt => opt.name === 'Copy Link');
          if (copyOption && copyOption.action) {
            copyOption.action();
          }
        }
        modal.remove();
      });
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
};

// Search utilities
const SearchUtils = {
  // Search questions
  searchQuestions(questions, query) {
    if (!query || query.trim().length === 0) {
      return questions;
    }
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return questions.filter(question => {
      const searchText = (
        question.title + ' ' + 
        question.details + ' ' + 
        question.category
      ).toLowerCase();
      
      return searchTerms.some(term => searchText.includes(term));
    });
  },

  // Highlight search results
  highlightSearchResults(text, query) {
    if (!query) return text;
    
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    let result = text;
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });
    
    return result;
  }
};

// Analytics utilities (basic client-side tracking)
const AnalyticsUtils = {
  // Track page view
  trackPageView(page) {
    const analytics = this.getAnalytics();
    const today = new Date().toDateString();
    
    if (!analytics.pageViews[today]) {
      analytics.pageViews[today] = {};
    }
    
    if (!analytics.pageViews[today][page]) {
      analytics.pageViews[today][page] = 0;
    }
    
    analytics.pageViews[today][page]++;
    this.saveAnalytics(analytics);
  },

  // Track action
  trackAction(action, data = {}) {
    const analytics = this.getAnalytics();
    const today = new Date().toDateString();
    
    if (!analytics.actions[today]) {
      analytics.actions[today] = [];
    }
    
    analytics.actions[today].push({
      action,
      data,
      timestamp: new Date().toISOString()
    });
    
    this.saveAnalytics(analytics);
  },

  // Get analytics data
  getAnalytics() {
    try {
      return JSON.parse(localStorage.getItem('anonqa_analytics')) || {
        pageViews: {},
        actions: {}
      };
    } catch (error) {
      return { pageViews: {}, actions: {} };
    }
  },

  // Save analytics data
  saveAnalytics(data) {
    localStorage.setItem('anonqa_analytics', JSON.stringify(data));
  },

  // Get basic stats
  getStats() {
    const analytics = this.getAnalytics();
    const today = new Date().toDateString();
    
    return {
      todayPageViews: Object.values(analytics.pageViews[today] || {}).reduce((a, b) => a + b, 0),
      todayActions: (analytics.actions[today] || []).length,
      totalDays: Object.keys(analytics.pageViews).length
    };
  }
};

// Export utilities to global scope
window.TimeUtils = TimeUtils;
window.TextUtils = TextUtils;
window.CategoryUtils = CategoryUtils;
window.ValidationUtils = ValidationUtils;
window.UIUtils = UIUtils;
window.ShareUtils = ShareUtils;
window.SearchUtils = SearchUtils;
window.AnalyticsUtils = AnalyticsUtils;

// Add CSS for toast notifications
const toastStyles = `
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    padding: 1rem 1.5rem;
    box-shadow: var(--shadow-lg);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  }
  
  .toast.toast-show {
    transform: translateX(0);
  }
  
  .toast.toast-hide {
    transform: translateX(100%);
  }
  
  .toast-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .toast-success {
    border-left: 4px solid var(--success-color);
  }
  
  .toast-error {
    border-left: 4px solid var(--danger-color);
  }
  
  .toast-warning {
    border-left: 4px solid var(--warning-color);
  }
  
  .toast-info {
    border-left: 4px solid var(--info-color);
  }
  
  .share-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
  }
  
  .share-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius);
    text-decoration: none;
    color: var(--text-primary);
    transition: var(--transition);
  }
  
  .share-option:hover {
    background: var(--primary-color);
    color: var(--text-light);
    text-decoration: none;
  }
`;

// Inject toast styles
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);
