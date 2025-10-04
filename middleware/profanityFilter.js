// middleware/profanityFilter.js
const badWords = [
  "badword1", "badword2", "badword3" // ✅ replace with actual words or use a larger list
];

// Middleware to check profanity in review comment
const profanityFilter = (req, res, next) => {
  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({
      success: false,
      message: "Review comment is required."
    });
  }

  const lowerComment = comment.toLowerCase();
  const foundWord = badWords.find(word => lowerComment.includes(word));

  if (foundWord) {
    return res.status(400).json({
      success: false,
      message: "Your review contains inappropriate language."
    });
  }

  next();
};

export default profanityFilter;
