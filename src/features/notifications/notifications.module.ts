import { Module } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { NotificationResolver } from './notifications.resolver';

@Module({
  controllers: [],
  providers: [NotificationResolver, PubSub],
})
export class NotificationsModule {}
