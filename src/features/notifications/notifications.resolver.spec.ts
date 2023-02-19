import { PubSub } from 'graphql-subscriptions';
import { mockDeep } from 'jest-mock-extended';
import { NotificationResolver } from './notifications.resolver';

jest.mock('graphql-subscriptions');

describe('notifications resolver', () => {
  it('returns all notifications', async () => {
    const resolver = new NotificationResolver(mockDeep<PubSub>());
    await expect(resolver.getNotifications()).resolves.toEqual([]);
  });

  it('returns a subscription', () => {
    const pubSubMock = mockDeep<PubSub>();
    const iteratorMock = mockDeep<AsyncIterator<Notification>>();
    pubSubMock.asyncIterator.mockReturnValueOnce(iteratorMock);

    const resolver = new NotificationResolver(pubSubMock);
    expect(resolver.notificationChanges()).toEqual(iteratorMock);
  });
});
