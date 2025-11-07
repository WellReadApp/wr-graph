import {
  Resolver,
  Query,
  Ctx,
  UseMiddleware,
  Arg,
  Mutation,
} from 'type-graphql';
import { User } from '@src/graph/user/types/User';
import { UserService } from '@src/graph/user/service';
import { isLoggedIn } from '@src/graph/middleware/helper';
import { Context } from '@src/graph/types/Context';

@Resolver((_of) => User)
export class UserRootResolver {
  
  @UseMiddleware(isLoggedIn)
  @Query((_returns) => User, { description: 'Returns info of logged in user' })
  async get_me(@Ctx() ctx: Context): Promise<User> {
    return await UserService.getUser(ctx.user_id);
  }

  @Mutation((_returns) => User, {
    description: 'Register a new user with email and password',
  })
  async signup(
    @Arg('email', {
      nullable: false,
      description: 'The email address of the user',
    })
    email: string,
    @Arg('password', {
      nullable: false,
      description: 'The password for the account',
    })
    password: string,
    @Arg('first_name', {
      nullable: true,
      description: 'The first name of the user',
    })
    firstName?: string,
    @Arg('last_name', {
      nullable: true,
      description: 'The last name of the user',
    })
    lastName?: string,
  ): Promise<User> {
    return await UserService.signup(email, password, firstName, lastName);
  }

  @Query((_returns) => String, {
    description: 'Login with email and password',
  })
  async login(
    @Arg('email', {
      nullable: false,
      description: 'The email address of the user',
    })
    email: string,
    @Arg('password', {
      nullable: false,
      description: 'The account password',
    })
    password: string,
  ): Promise<string> {
    return await UserService.login(email, password);
  }

  @Mutation((_returns) => Boolean, {
    description: 'Request password reset email',
  })
  async forgot_password(
    @Arg('email', {
      nullable: false,
      description: 'The email address of the user',
    })
    email: string,
  ): Promise<boolean> {
    return await UserService.forgotPassword(email);
  }

  @Mutation((_returns) => Boolean, {
    description: 'Reset password using token from email',
  })
  async reset_password(
    @Arg('token', {
      nullable: false,
      description: 'The reset token from the email',
    })
    token: string,
    @Arg('new_password', {
      nullable: false,
      description: 'The new password to set',
    })
    newPassword: string,
  ): Promise<boolean> {
    return await UserService.resetPassword(token, newPassword);
  }

  @UseMiddleware(isLoggedIn)
  @Mutation((_returns) => Boolean, {
    description: 'Change password when logged in',
  })
  async change_password(
    @Ctx() ctx: Context,
    @Arg('current_password', {
      nullable: false,
      description: 'Current password for verification',
    })
    currentPassword: string,
    @Arg('new_password', {
      nullable: false,
      description: 'New password to set',
    })
    newPassword: string,
  ): Promise<boolean> {
    return await UserService.changePassword(ctx, currentPassword, newPassword);
  }

  @UseMiddleware(isLoggedIn)
  @Mutation((_returns) => User, {
    description: 'Update user profile information',
  })
  async update_user_profile(
    @Ctx() ctx: Context,
    @Arg('first_name', { description: 'The first name of user' })
    first_name: string,
    @Arg('last_name', { description: 'The last name of user' })
    last_name: string,
    @Arg('set_profile_picture_null', {
      nullable: true,
      description: 'Set profile picture as null',
    })
    set_profile_picture_null: boolean,
  ): Promise<User> {
    return await UserService.updateUserProfile(
      ctx,
      first_name,
      last_name,
      set_profile_picture_null,
    );
  }

  @UseMiddleware(isLoggedIn)
  @Mutation((_returns) => Boolean, {
    description: 'Logs out the user and invalidates the token',
  })
  async logout(@Ctx() ctx: Context): Promise<boolean> {
    return await UserService.logout(ctx);
  }
}