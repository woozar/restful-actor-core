import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { CallbackUrl } from './callback-url.model';
import { Method } from './method.model';

@ObjectType()
export class Callback {
  @Field(/* istanbul ignore next */ () => String)
  name: string;

  @Field(/* istanbul ignore next */ () => [CallbackUrl])
  public get urls(): CallbackUrl[] {
    return Object.keys(this.rawData).map((url) => new CallbackUrl(this, url, this.rawData[url], this.specService));
  }

  @Field(/* istanbul ignore next */ () => [String])
  public get namespace(): string[] {
    return [...this.parent.namespace, `callback: ${this.name}`];
  }

  @Field(/* istanbul ignore next */ () => Method)
  public parent: Method;

  constructor(parent: Method, name: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(name);
    this.name = name;
  }

  private validateRawData(name: string): void {
    if (!name || typeof name !== 'string') throw NsError.notAStringOrEmpty(this, 'name');
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
  }
}

export enum ParameterIn {
  Path = 'path',
  Query = 'query',
  Header = 'header',
}

registerEnumType(ParameterIn, { name: 'ParameterIn' });
