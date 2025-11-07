import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '@src/libs/db';
import { generateToken } from '@src/libs/usertoken';
import { AuthorizationError, BadRequestError } from '../errors';
import { User } from './types/User';
import { Context } from '../types/Context';

export class UserService {

  static async getUser(id: string): Promise<User> {
    const user = await db.queryOne(
      `SELECT id, email, first_name, last_name, picture_url, created_at, updated_at 
       FROM "user"."user" WHERE id = $1`,
      [id]
    );
    return user;
  }

  static async signup(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<User> {
    const existingUser = await db.queryOne(
      `SELECT id FROM "user"."user" WHERE email = $1`,
      [email]
    );

    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.queryOne(
      `INSERT INTO "user"."user" (email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, first_name, last_name, picture_url, created_at, updated_at`,
      [email, passwordHash, firstName, lastName]
    );

    return user;
  }

  static async login(email: string, password: string): Promise<string> {
    const user = await db.queryOne(
      `SELECT id, email, password_hash FROM "user"."user" WHERE email = $1`,
      [email]
    );

    if (!user) {
      throw new AuthorizationError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      throw new AuthorizationError('Invalid email or password');
    }
    
    const token = generateToken(user.id, '24h');
    await db.query(
      `INSERT INTO "user".user_token (user_id, token) VALUES ($1, $2)`,
      [user.id, token]
    );

    return token;
  }

  static async forgotPassword(email: string): Promise<boolean> {
    const user = await db.queryOne(
      `SELECT id FROM "user"."user" WHERE email = $1`,
      [email]
    );

    if (!user) {
      return true; // Return true even if user doesn't exist for security
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.query(
      `UPDATE "user"."user"
       SET reset_token = $1, reset_token_expires = $2 
       WHERE id = $3`,
      [resetToken, resetTokenExpires, user.id]
    );

    // TODO: Send reset password email with token
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    return true;
  }

  static async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await db.queryOne(
      `SELECT id FROM "user"."user"
       WHERE reset_token = $1 
       AND reset_token_expires > NOW()`,
      [token]
    );

    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE "user"."user" 
       SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL 
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    return true;
  }

  static async updateUserProfile(
    ctx: Context,
    firstName: string,
    lastName: string,
    setProfilePictureNull = false
  ): Promise<User> {
    const user = await db.queryOne(
      `UPDATE "user"."user" 
       SET first_name = $1, last_name = $2, 
           picture_url = CASE WHEN $3 THEN NULL ELSE picture_url END 
       WHERE id = $4 
       RETURNING id, email, first_name, last_name, picture_url, created_at, updated_at`,
      [firstName, lastName, setProfilePictureNull, ctx.user_id]
    );
    return user;
  }

  static async logout(ctx: Context): Promise<boolean> {
    await db.query(
      `UPDATE "user".user_token SET revoked = TRUE 
       WHERE user_id = $1 AND token = $2`,
      [ctx.user_id, ctx.token]
    );
    return true;
  }

  static async changePassword(
    ctx: Context,
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    const user = await db.queryOne(
      `SELECT password_hash FROM "user"."user"  WHERE id = $1`,
      [ctx.user_id]
    );

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new AuthorizationError('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE "user" SET password_hash = $1 WHERE id = $2`,
      [passwordHash, ctx.user_id]
    );

    return true;
  }

}