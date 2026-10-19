import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== 'amirkhanbosbehet') {
      throw new UnauthorizedException('Invalid API key');
    }
    console.log(req.url);
    console.log(res.statusCode);
    next();
  }
}
