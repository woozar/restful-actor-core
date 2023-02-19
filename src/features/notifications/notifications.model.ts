import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { v4 } from 'uuid';

@ObjectType()
export class Notification {
  @Field(/* istanbul ignore next */ () => String)
  id: string = v4();

  @Field(/* istanbul ignore next */ () => NotificationEvent)
  event: NotificationEvent;

  @Field(/* istanbul ignore next */ () => String)
  message: string;

  constructor(event: NotificationEvent, message: string) {
    this.event = event;
    this.message = message;
  }
}

export enum NotificationEvent {
  Created = 'created',
  Updated = 'updated',
  Deleted = 'deleted',
}

registerEnumType(NotificationEvent, { name: 'NotificationEvent' });
