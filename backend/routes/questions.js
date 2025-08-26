const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Get all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Ask a new question
router.post('/', async (req, res) => {
  const { title, details } = req.body;
  const question = new Question({ title, details });
  try {
    const saved = await question.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Answer a question
router.post('/:id/answers', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    question.answers.push({ text: req.body.text });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Like a question
router.post('/:id/like', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    question.likes += 1;
    await question.save();
    
    res.json({ 
      likes: question.likes, 
      dislikes: question.dislikes,
      message: 'Question liked successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dislike a question
router.post('/:id/dislike', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    question.dislikes += 1;
    await question.save();
    
    res.json({ 
      likes: question.likes, 
      dislikes: question.dislikes,
      message: 'Question disliked successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Like an answer
router.post('/:qid/answers/:aid/like', async (req, res) => {
  try {
    const question = await Question.findById(req.params.qid);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    const answer = question.answers.id(req.params.aid);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    
    answer.likes += 1;
    await question.save();
    
    res.json({ 
      likes: answer.likes, 
      dislikes: answer.dislikes,
      message: 'Answer liked successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Dislike an answer
router.post('/:qid/answers/:aid/dislike', async (req, res) => {
  try {
    const question = await Question.findById(req.params.qid);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    const answer = question.answers.id(req.params.aid);
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    
    answer.dislikes += 1;
    await question.save();
    
    res.json({ 
      likes: answer.likes, 
      dislikes: answer.dislikes,
      message: 'Answer disliked successfully' 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;