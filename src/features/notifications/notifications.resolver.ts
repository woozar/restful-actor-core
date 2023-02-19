import { Query, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Notification } from './notifications.model';

export const NOTIFICATIONS = 'notifications';

@Resolver(/* istanbul ignore next */ () => Notification)
export class NotificationResolver {
  constructor(private pubSub: PubSub) {}

  @Query(/* istanbul ignore next */ () => [Notification])
  async getNotifications(): Promise<Notification[]> {
    return [];
  }

  @Subscription(/* istanbul ignore next */ () => Notification, {
    resolve: /* istanbul ignore next */ (payload) => payload,
  })
  notificationChanges() {
    return this.pubSub.asyncIterator<Notification>(NOTIFICATIONS);
  }
}
