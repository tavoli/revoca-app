import jwtLib from 'jsonwebtoken';

const tls7days = 60 * 60 * 24 * 7;

const createToken = (payload: any) => {
  return jwtLib.sign(payload, process.env.JWT_SECRET, {
    expiresIn: tls7days,
  });
}

const verifyToken = (token: string) => {
  return jwtLib.verify(token, process.env.JWT_SECRET);
}

const decodeToken = (token: string) => {
  return jwtLib.decode(token);
}

const cookieConfig = {
  maxAge: tls7days,
  httpOnly: true,
  secure: true,
};

const jwt = {
  createToken,
  verifyToken,
  decodeToken,
  cookieConfig,
};

export { jwt };

