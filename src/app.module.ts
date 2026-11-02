import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserModule } from './user/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard.js';
import { ApiKeyMiddleware } from './middleware/api-key/api-key.middleware.js';
import { UserController } from './user/user.controller.js';
import { MonitorsModule } from './monitors/monitors.module.js';
import { MonitoringModule } from './monitoring/monitoring.module.js';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module.js';
import { IncidentsModule } from './incidents/incidents.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'nlp',
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    MonitorsModule,
    MonitoringModule,
    NotificationSettingsModule,
    IncidentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard }, // ← global auth
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
  }
}
