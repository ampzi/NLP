import { ApiKeyMiddleware } from './api-key.middleware.js';

describe('ApiKeyMiddleware', () => {
  it('should be defined', () => {
    expect(new ApiKeyMiddleware()).toBeDefined();
  });
});
