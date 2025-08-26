// Test data for UI development and testing
const MOCK_QUESTIONS = [
  {
    _id: "507f1f77bcf86cd799439011",
    title: "How does machine learning actually work?",
    details: "I keep hearing about machine learning everywhere, but I don't understand the basic concepts. Can someone explain it in simple terms?",
    createdAt: "2024-01-15T10:30:00Z",
    likes: 12,
    dislikes: 2,
    answers: [
      {
        _id: "507f1f77bcf86cd799439012",
        text: "Machine learning is like teaching a computer to recognize patterns by showing it lots of examples. Instead of programming specific rules, you feed it data and let it figure out the patterns on its own.",
        createdAt: "2024-01-15T11:45:00Z",
        likes: 8,
        dislikes: 1
      },
      {
        _id: "507f1f77bcf86cd799439013",
        text: "Think of it like learning to ride a bike. You don't memorize every possible situation - you practice until you can balance and react naturally. ML algorithms do something similar with data.",
        createdAt: "2024-01-15T14:20:00Z",
        likes: 15,
        dislikes: 0
      }
    ]
  },
  {
    _id: "507f1f77bcf86cd799439014",
    title: "What's the best way to start learning programming?",
    details: "",
    createdAt: "2024-01-14T09:15:00Z",
    likes: 25,
    dislikes: 3,
    answers: [
      {
        _id: "507f1f77bcf86cd799439015",
        text: "Start with Python! It's beginner-friendly and has a huge community. Try Codecademy or freeCodeCamp for interactive learning.",
        createdAt: "2024-01-14T10:30:00Z",
        likes: 22,
        dislikes: 1
      }
    ]
  },
  {
    _id: "507f1f77bcf86cd799439016",
    title: "Why is climate change happening so fast now?",
    details: "The news keeps talking about accelerating climate change. What's causing this acceleration?",
    createdAt: "2024-01-13T16:45:00Z",
    likes: 7,
    dislikes: 1,
    answers: []
  }
];

// Mock API responses for testing
const MOCK_API = {
  questions: MOCK_QUESTIONS,
  
  // Simulate API delay
  delay: (ms = 500) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock API methods
  async getAllQuestions() {
    await this.delay();
    return [...this.questions];
  },
  
  async likeQuestion(questionId) {
    await this.delay(200);
    const question = this.questions.find(q => q._id === questionId);
    if (question) {
      question.likes += 1;
      return { likes: question.likes, dislikes: question.dislikes, message: 'Question liked!' };
    }
    throw new Error('Question not found');
  },
  
  async dislikeQuestion(questionId) {
    await this.delay(200);
    const question = this.questions.find(q => q._id === questionId);
    if (question) {
      question.dislikes += 1;
      return { likes: question.likes, dislikes: question.dislikes, message: 'Question disliked!' };
    }
    throw new Error('Question not found');
  },
  
  async likeAnswer(questionId, answerId) {
    await this.delay(200);
    const question = this.questions.find(q => q._id === questionId);
    if (question) {
      const answer = question.answers.find(a => a._id === answerId);
      if (answer) {
        answer.likes += 1;
        return { likes: answer.likes, dislikes: answer.dislikes, message: 'Answer liked!' };
      }
    }
    throw new Error('Answer not found');
  },
  
  async dislikeAnswer(questionId, answerId) {
    await this.delay(200);
    const question = this.questions.find(q => q._id === questionId);
    if (question) {
      const answer = question.answers.find(a => a._id === answerId);
      if (answer) {
        answer.dislikes += 1;
        return { likes: answer.likes, dislikes: answer.dislikes, message: 'Answer disliked!' };
      }
    }
    throw new Error('Answer not found');
  },
  
  async submitReport(reportData) {
    await this.delay(300);
    console.log('Report submitted:', reportData);
    return { message: 'Report submitted successfully. Thank you for helping keep our community safe.' };
  }
};

export { MOCK_QUESTIONS, MOCK_API };