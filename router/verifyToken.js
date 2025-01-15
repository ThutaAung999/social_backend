import jwt from 'jsonwebtoken';

const JWT_SECRET = '#zinyawhteinhtein222222222';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader;

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err)
        return res
          .status(400)
          .json({ message: 'Some error occurs: ', error: err });
      req.user = user;
      next();
    });
  } else {
    return res.status(400).json('Access token is not valid');
  }
};

export default verifyToken;
