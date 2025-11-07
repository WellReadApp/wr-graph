import { AuthorizationError } from '@src/graph/errors';
import { Context } from '@src/graph/types/Context';
import db from '@src/libs/db';
import { MiddlewareFn } from 'type-graphql';

export const isLoggedIn: MiddlewareFn<Context> = async ({ context }, next) => {
  if (!context.user_id || !context.token) {
    throw new AuthorizationError('Not authenticated');
  }

  // Check if token is valid and not revoked
  const validToken = await db.queryOne(`
    SELECT id 
    FROM "user".user_token 
    WHERE user_id = $1 
    AND token = $2 
    AND revoked = FALSE
  `, [context.user_id, context.token]);

  if (!validToken) {
    throw new AuthorizationError('Invalid or expired session');
  }

  // Check if user still exists and is active
  const user = await db.queryOne(`
    SELECT id 
    FROM "user"."user" 
    WHERE id = $1
  `, [context.user_id]);

  if (!user) {
    throw new AuthorizationError('User not found');
  }

  return next();
};