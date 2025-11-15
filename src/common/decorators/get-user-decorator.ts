import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

export interface GetUserOptions {
  required?: boolean;
  roles?: UserRole[];
}

export const GetUser = createParamDecorator(
  (options: GetUserOptions, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    options = {
      required: true,
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.TELLER],

      ...options,
    };

    // Get user from request (set by AuthGuard)
    const user = request.user;

    if (options.required && !user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!user) {
      return null;
    }

    // Check roles if specified
    if (
      options.roles &&
      options.roles.length > 0 &&
      !options.roles.includes(user.role)
    ) {
      throw new UnauthorizedException('Insufficient permissions');
    }

    return user;
  },
);
