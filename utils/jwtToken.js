const sendToken = (user, statusCode, res) => {
  const token_blog = user.getJwtToken();

  // options for cookies
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'None', // Adjust based on your requirements and SSL setup
    secure: true,     // Make sure to set this to true if using HTTPS
  };
  res.status(statusCode).cookie("token_blog", token_blog, options).json({
    success: true,
    user,
    token_blog,
  });
};

module.exports = sendToken;
