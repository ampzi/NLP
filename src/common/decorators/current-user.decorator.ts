import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Pulls a property off req.user (set by your auth guard).
 *   @CurrentUser()      → whole user object
 *   @CurrentUser('id')  → req.user.id
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return data ? req.user?.[data] : req.user;
  },
);
