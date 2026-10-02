import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // F21: If Bearer token is present in Authorization header, parse and bind user
      const request = context.switchToHttp().getRequest();
      const authHeader = request?.headers?.authorization;
      if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
        return true;
      }
      try {
        const result = super.canActivate(context);
        if (result instanceof Promise) {
          await result;
        }
        return true;
      } catch {
        // If token is invalid or expired on public route, continue as unauthenticated guest
        return true;
      }
    }

    const res = super.canActivate(context);
    if (res instanceof Promise) {
      return await res;
    }
    return res as boolean;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // If error or missing user on a public route, do not throw
      return user || null;
    }

    if (err || !user) {
      throw err || new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
    }
    return user;
  }
}

