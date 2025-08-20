// Local Storage Manager for AnonQ&A Platform
class StorageManager {
  constructor() {
    this.questionsKey = 'anonqa_questions';
    this.answersKey = 'anonqa_answers';
    this.reportsKey = 'anonqa_reports';
    this.votesKey = 'anonqa_votes';
    
    this.initializeStorage();
  }

  // Initialize storage with default data if empty
  initializeStorage() {
    if (!localStorage.getItem(this.questionsKey)) {
      localStorage.setItem(this.questionsKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.answersKey)) {
      localStorage.setItem(this.answersKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.reportsKey)) {
      localStorage.setItem(this.reportsKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.votesKey)) {
      localStorage.setItem(this.votesKey, JSON.stringify({}));
    }
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get current timestamp
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  // Questions CRUD operations
  saveQuestion(questionData) {
    const questions = this.getQuestions();
    const newQuestion = {
      id: this.generateId(),
      title: questionData.title,
      details: questionData.details || '',
      category: questionData.category,
      timestamp: this.getCurrentTimestamp(),
      likes: 0,
      dislikes: 0,
      answersCount: 0
    };
    
    questions.push(newQuestion);
    localStorage.setItem(this.questionsKey, JSON.stringify(questions));
    return newQuestion;
  }

  getQuestions() {
    try {
      return JSON.parse(localStorage.getItem(this.questionsKey)) || [];
    } catch (error) {
      console.error('Error parsing questions from storage:', error);
      return [];
    }
  }

  getQuestionById(id) {
    const questions = this.getQuestions();
    return questions.find(question => question.id === id);
  }

  updateQuestion(id, updates) {
    const questions = this.getQuestions();
    const index = questions.findIndex(question => question.id === id);
    
    if (index !== -1) {
      questions[index] = { ...questions[index], ...updates };
      localStorage.setItem(this.questionsKey, JSON.stringify(questions));
      return questions[index];
    }
    return null;
  }

  deleteQuestion(id) {
    const questions = this.getQuestions();
    const filteredQuestions = questions.filter(question => question.id !== id);
    localStorage.setItem(this.questionsKey, JSON.stringify(filteredQuestions));
    
    // Also remove associated answers
    const answers = this.getAnswers();
    const filteredAnswers = answers.filter(answer => answer.questionId !== id);
    localStorage.setItem(this.answersKey, JSON.stringify(filteredAnswers));
  }

  // Answers CRUD operations
  saveAnswer(answerData) {
    const answers = this.getAnswers();
    const newAnswer = {
      id: this.generateId(),
      questionId: answerData.questionId,
      content: answerData.content,
      timestamp: this.getCurrentTimestamp(),
      likes: 0,
      dislikes: 0
    };
    
    answers.push(newAnswer);
    localStorage.setItem(this.answersKey, JSON.stringify(answers));
    
    // Update question answer count
    const question = this.getQuestionById(answerData.questionId);
    if (question) {
      this.updateQuestion(answerData.questionId, { 
        answersCount: question.answersCount + 1 
      });
    }
    
    return newAnswer;
  }

  getAnswers() {
    try {
      return JSON.parse(localStorage.getItem(this.answersKey)) || [];
    } catch (error) {
      console.error('Error parsing answers from storage:', error);
      return [];
    }
  }

  getAnswersByQuestionId(questionId) {
    const answers = this.getAnswers();
    return answers.filter(answer => answer.questionId === questionId);
  }

  updateAnswer(id, updates) {
    const answers = this.getAnswers();
    const index = answers.findIndex(answer => answer.id === id);
    
    if (index !== -1) {
      answers[index] = { ...answers[index], ...updates };
      localStorage.setItem(this.answersKey, JSON.stringify(answers));
      return answers[index];
    }
    return null;
  }

  deleteAnswer(id) {
    const answers = this.getAnswers();
    const answer = answers.find(a => a.id === id);
    const filteredAnswers = answers.filter(answer => answer.id !== id);
    localStorage.setItem(this.answersKey, JSON.stringify(filteredAnswers));
    
    // Update question answer count
    if (answer) {
      const question = this.getQuestionById(answer.questionId);
      if (question && question.answersCount > 0) {
        this.updateQuestion(answer.questionId, { 
          answersCount: question.answersCount - 1 
        });
      }
    }
  }

  // Voting system
  voteOnQuestion(questionId, voteType) {
    const votes = this.getVotes();
    const voteKey = `question_${questionId}`;
    
    // Check if user already voted
    const existingVote = votes[voteKey];
    const question = this.getQuestionById(questionId);
    
    if (!question) return null;
    
    let updates = {};
    
    if (existingVote === voteType) {
      // Remove vote
      delete votes[voteKey];
      if (voteType === 'like') {
        updates.likes = Math.max(0, question.likes - 1);
      } else {
        updates.dislikes = Math.max(0, question.dislikes - 1);
      }
    } else {
      // Add or change vote
      if (existingVote) {
        // Change from opposite vote
        if (existingVote === 'like') {
          updates.likes = Math.max(0, question.likes - 1);
          updates.dislikes = question.dislikes + 1;
        } else {
          updates.dislikes = Math.max(0, question.dislikes - 1);
          updates.likes = question.likes + 1;
        }
      } else {
        // New vote
        if (voteType === 'like') {
          updates.likes = question.likes + 1;
        } else {
          updates.dislikes = question.dislikes + 1;
        }
      }
      votes[voteKey] = voteType;
    }
    
    localStorage.setItem(this.votesKey, JSON.stringify(votes));
    return this.updateQuestion(questionId, updates);
  }

  voteOnAnswer(answerId, voteType) {
    const votes = this.getVotes();
    const voteKey = `answer_${answerId}`;
    
    // Check if user already voted
    const existingVote = votes[voteKey];
    const answers = this.getAnswers();
    const answer = answers.find(a => a.id === answerId);
    
    if (!answer) return null;
    
    let updates = {};
    
    if (existingVote === voteType) {
      // Remove vote
      delete votes[voteKey];
      if (voteType === 'like') {
        updates.likes = Math.max(0, answer.likes - 1);
      } else {
        updates.dislikes = Math.max(0, answer.dislikes - 1);
      }
    } else {
      // Add or change vote
      if (existingVote) {
        // Change from opposite vote
        if (existingVote === 'like') {
          updates.likes = Math.max(0, answer.likes - 1);
          updates.dislikes = answer.dislikes + 1;
        } else {
          updates.dislikes = Math.max(0, answer.dislikes - 1);
          updates.likes = answer.likes + 1;
        }
      } else {
        // New vote
        if (voteType === 'like') {
          updates.likes = answer.likes + 1;
        } else {
          updates.dislikes = answer.dislikes + 1;
        }
      }
      votes[voteKey] = voteType;
    }
    
    localStorage.setItem(this.votesKey, JSON.stringify(votes));
    return this.updateAnswer(answerId, updates);
  }

  getVotes() {
    try {
      return JSON.parse(localStorage.getItem(this.votesKey)) || {};
    } catch (error) {
      console.error('Error parsing votes from storage:', error);
      return {};
    }
  }

  getUserVote(itemType, itemId) {
    const votes = this.getVotes();
    return votes[`${itemType}_${itemId}`] || null;
  }

  // Reports system
  saveReport(reportData) {
    const reports = this.getReports();
    const newReport = {
      id: this.generateId(),
      itemType: reportData.itemType, // 'question' or 'answer'
      itemId: reportData.itemId,
      reason: reportData.reason,
      details: reportData.details || '',
      timestamp: this.getCurrentTimestamp(),
      status: 'pending'
    };
    
    reports.push(newReport);
    localStorage.setItem(this.reportsKey, JSON.stringify(reports));
    
    // Simulate email notification (in real app, this would be sent to admin)
    console.log('Report submitted:', newReport);
    this.sendReportNotification(newReport);
    
    return newReport;
  }

  getReports() {
    try {
      return JSON.parse(localStorage.getItem(this.reportsKey)) || [];
    } catch (error) {
      console.error('Error parsing reports from storage:', error);
      return [];
    }
  }

  // Simulate sending email notification for reports
  sendReportNotification(report) {
    const emailData = {
      to: 'admin@anonqa.com',
      subject: 'New Content Report Submitted',
      body: `
        A new report has been submitted:
        
        Type: ${report.itemType}
        Item ID: ${report.itemId}
        Reason: ${report.reason}
        Details: ${report.details}
        Timestamp: ${report.timestamp}
        
        Please review this content for moderation.
      `
    };
    
    // In a real application, this would make an API call to send email
    console.log('Email notification sent:', emailData);
  }

  // Filtering and sorting utilities
  getFilteredQuestions(category = '', sortBy = 'trending') {
    let questions = this.getQuestions();
    
    // Filter by category
    if (category) {
      questions = questions.filter(q => q.category === category);
    }
    
    // Sort questions
    switch (sortBy) {
      case 'trending':
        // Sort by like ratio and engagement
        questions.sort((a, b) => {
          const aScore = (a.likes - a.dislikes) + (a.answersCount * 0.5);
          const bScore = (b.likes - b.dislikes) + (b.answersCount * 0.5);
          return bScore - aScore;
        });
        break;
        
      case 'latest':
        // Sort by timestamp (newest first)
        questions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
        
      case 'most_liked':
        questions.sort((a, b) => b.likes - a.likes);
        break;
        
      case 'most_answered':
        questions.sort((a, b) => b.answersCount - a.answersCount);
        break;
        
      default:
        break;
    }
    
    return questions;
  }

  // Data export/import for backup
  exportData() {
    return {
      questions: this.getQuestions(),
      answers: this.getAnswers(),
      reports: this.getReports(),
      votes: this.getVotes(),
      timestamp: this.getCurrentTimestamp()
    };
  }

  importData(data) {
    try {
      if (data.questions) {
        localStorage.setItem(this.questionsKey, JSON.stringify(data.questions));
      }
      if (data.answers) {
        localStorage.setItem(this.answersKey, JSON.stringify(data.answers));
      }
      if (data.reports) {
        localStorage.setItem(this.reportsKey, JSON.stringify(data.reports));
      }
      if (data.votes) {
        localStorage.setItem(this.votesKey, JSON.stringify(data.votes));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data (for development/testing)
  clearAllData() {
    localStorage.removeItem(this.questionsKey);
    localStorage.removeItem(this.answersKey);
    localStorage.removeItem(this.reportsKey);
    localStorage.removeItem(this.votesKey);
    this.initializeStorage();
  }

  // Get storage statistics
  getStats() {
    const questions = this.getQuestions();
    const answers = this.getAnswers();
    const reports = this.getReports();
    
    return {
      totalQuestions: questions.length,
      totalAnswers: answers.length,
      totalReports: reports.length,
      categoryCounts: this.getCategoryCounts(questions),
      recentActivity: this.getRecentActivity()
    };
  }

  getCategoryCounts(questions) {
    const counts = {};
    questions.forEach(q => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }

  getRecentActivity() {
    const questions = this.getQuestions();
    const answers = this.getAnswers();
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentQuestions = questions.filter(q => new Date(q.timestamp) > oneWeekAgo);
    const recentAnswers = answers.filter(a => new Date(a.timestamp) > oneWeekAgo);
    
    return {
      questionsThisWeek: recentQuestions.length,
      answersThisWeek: recentAnswers.length
    };
  }
}

// Export for use in other scripts
window.StorageManager = StorageManager;
