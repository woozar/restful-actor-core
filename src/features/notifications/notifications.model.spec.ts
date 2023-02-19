import { v4 } from 'uuid';
import { Notification, NotificationEvent } from './notifications.model';

jest.mock('uuid');

describe('notifications model', () => {
  it('provide all properties', () => {
    jest.mocked(v4).mockReturnValueOnce('09d31b00-1201-46c7-9edb-c2088bb8bc8a');
    const noti = new Notification(NotificationEvent.Created, 'something was created');

    expect(noti.id).toEqual('09d31b00-1201-46c7-9edb-c2088bb8bc8a');
    expect(noti.event).toEqual(NotificationEvent.Created);
    expect(noti.message).toEqual('something was created');
  });
});
