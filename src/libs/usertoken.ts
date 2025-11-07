import jwt from 'jsonwebtoken';

/**
 * Generates a JWT token
 * @param userId The user id to generate jwt
 * @param expiry The token expiry
 * @returns JWT token
 */
export const generateToken = (userId: string, expiry: string) => {
  const payload = {
    user: {
      id: userId,
    },
  };
  const privateKEY = process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
  return jwt.sign(payload, privateKEY, {
    expiresIn: expiry,
    algorithm: 'RS256',
  });
};
