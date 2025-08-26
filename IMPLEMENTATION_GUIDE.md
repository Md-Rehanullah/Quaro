# Like, Dislike, and Report Features - Implementation Guide

This document provides implementation details and deployment guidance for the newly added Like, Dislike, and Report features in the Quaro Q&A platform.

## Features Implemented

### 1. **Persistent Voting System**
- **Question Voting**: Users can like/dislike questions with real-time count updates
- **Answer Voting**: Users can like/dislike individual answers with real-time count updates
- **Vote Persistence**: All votes are stored in MongoDB and persist across sessions
- **Spam Prevention**: Temporary button disabling prevents rapid clicking

### 2. **Content Reporting System**
- **Question Reporting**: Users can report inappropriate questions
- **Answer Reporting**: Users can report inappropriate answers
- **Email Notifications**: Reports are automatically emailed to moderators
- **Report Categories**: Predefined categories (Spam, Inappropriate content, Harassment, etc.)
- **Additional Details**: Optional text field for more context

### 3. **Enhanced UI/UX**
- **Intuitive Buttons**: Clear like/dislike/report buttons with icons
- **Live Counters**: Real-time display of like/dislike counts
- **Toast Notifications**: User feedback for all actions
- **Responsive Design**: Works on all device sizes

## Backend Implementation

### Database Schema Updates

#### Question Schema
```javascript
const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: String,
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },        // NEW
  dislikes: { type: Number, default: 0 },     // NEW
  answers: [answerSchema]
});
```

#### Answer Schema
```javascript
const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },        // NEW
  dislikes: { type: Number, default: 0 }      // NEW
});
```

### API Endpoints

#### Voting Endpoints
```
POST /api/questions/:id/like          - Like a question
POST /api/questions/:id/dislike       - Dislike a question
POST /api/questions/:qid/answers/:aid/like    - Like an answer
POST /api/questions/:qid/answers/:aid/dislike - Dislike an answer
```

#### Reporting Endpoint
```
POST /api/report                      - Submit a content report
```

### Email Configuration

The reporting system uses **Nodemailer** with Gmail SMTP. To configure:

1. **Install Dependencies** (already done):
   ```bash
   npm install nodemailer
   ```

2. **Environment Variables** (add to your `.env` file):
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   ```

3. **Gmail App Password Setup**:
   - Go to Google Account settings
   - Enable 2-factor authentication
   - Go to Security > App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular Gmail password)

## Frontend Implementation

### API Integration
- **Mock Mode**: Automatically detects localhost and uses mock data for development
- **Production Mode**: Uses real API endpoints for production deployment
- **Error Handling**: Graceful fallbacks and user-friendly error messages

### UI Components
- **Voting Buttons**: Styled with hover effects and disabled states
- **Report Modal**: Complete form with validation and confirmation
- **Toast Notifications**: Success/error feedback for all actions

## Testing

### Manual Testing Completed
✅ **Question Voting**: Like/dislike buttons update counts correctly  
✅ **Answer Voting**: Like/dislike buttons work for individual answers  
✅ **Report Submission**: Modal opens, form validates, submits successfully  
✅ **UI Responsiveness**: All buttons and modals work on different screen sizes  
✅ **Mock Data**: Development mode works without backend API  
✅ **Toast Notifications**: User feedback appears for all actions  

### Production Testing Checklist
- [ ] Test with real MongoDB database
- [ ] Verify email sending with actual Gmail credentials
- [ ] Test all endpoints with production API
- [ ] Load test voting system under high traffic
- [ ] Verify CORS settings for production domain

## Deployment Guide

### Backend Deployment

1. **Environment Setup**:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   PORT=1000
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   ```

2. **Dependencies**: Already included in package.json
   ```json
   "nodemailer": "^6.9.0"
   ```

3. **CORS Configuration**: Updated to support multiple origins
   ```javascript
   app.use(cors({
     origin: [
       'https://md-rehanullah.github.io',
       'http://localhost:3000',
       'http://localhost:8000'
     ]
   }));
   ```

### Frontend Deployment

1. **API Configuration**: Update `js/api.js` with production API URL
2. **Mock Mode**: Automatically disabled in production (based on hostname)
3. **Static Files**: Serve all files through your web server

## Security Considerations

### Implemented Safeguards
- **Rate Limiting**: Button disabling prevents spam clicking
- **Input Validation**: All form inputs are validated
- **Email Security**: Uses secure Gmail SMTP with app passwords
- **CORS Protection**: Configured for specific allowed origins

### Recommended Enhancements
- **User Authentication**: Consider adding user accounts for vote tracking
- **IP Rate Limiting**: Implement server-side rate limiting
- **Captcha**: Add captcha for report submissions
- **Vote Uniqueness**: Prevent multiple votes from same user/IP

## Troubleshooting

### Common Issues

1. **Email Not Sending**:
   - Verify Gmail app password is correct
   - Check 2FA is enabled on Gmail account
   - Ensure EMAIL_USER and EMAIL_PASS env vars are set

2. **CORS Errors**:
   - Add your domain to the CORS origin array in server.js
   - Verify API_CONFIG.BASE_URL points to correct backend

3. **Vote Counts Not Updating**:
   - Check MongoDB connection
   - Verify question/answer IDs are valid
   - Check browser console for API errors

4. **Mock Data Not Loading**:
   - Ensure you're accessing via localhost
   - Check browser console for import errors
   - Verify mock-data.js file exists

## File Changes Summary

### Backend Files Modified/Added
- `backend/models/Question.js` - Added likes/dislikes fields
- `backend/routes/questions.js` - Added voting endpoints
- `backend/routes/reports.js` - **NEW** - Report handling
- `backend/server.js` - Added report routes, updated CORS
- `package.json` - Added nodemailer dependency

### Frontend Files Modified/Added
- `js/api.js` - Added voting/reporting methods, mock mode
- `js/app.js` - Updated rendering, event handling
- `js/mock-data.js` - **NEW** - Development test data
- `css/style.css` - Added voting button styles
- `.env.example` - Added email configuration guide

## Future Enhancements

### Suggested Improvements
1. **Vote Analytics**: Track voting patterns and trends
2. **User Profiles**: Associate votes with user accounts
3. **Moderation Dashboard**: Admin interface for managing reports
4. **Voting History**: Allow users to see their voting history
5. **Advanced Reporting**: More detailed report categorization
6. **Email Templates**: HTML email templates for reports
7. **Real-time Updates**: WebSocket support for live vote updates

## Support

For questions or issues with this implementation, please:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify environment configuration
4. Test with mock data first to isolate issues

---

**Implementation completed by**: GitHub Copilot Assistant  
**Date**: January 2024  
**Version**: 1.0.0