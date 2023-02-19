import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Callback } from './callback.model';
import { Method } from './method.model';

@ObjectType()
export class CallbackUrl {
  @Field(/* istanbul ignore next */ () => String)
  url: string;

  @Field(/* istanbul ignore next */ () => [Method])
  public get methods(): Method[] {
    return Object.keys(this.rawData)
      .filter(Method.isValidMethod)
      .map((method) => new Method(this, method, this.rawData[method], this.specService));
  }

  @Field(/* istanbul ignore next */ () => [String])
  public get namespace(): string[] {
    return [...this.parent.namespace, `url: ${this.url}`];
  }

  @Field(/* istanbul ignore next */ () => Callback)
  public parent: Callback;

  constructor(parent: Callback, url: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(url);
    this.url = url;
  }

  private validateRawData(url: string): void {
    if (!url || typeof url !== 'string') throw NsError.notAStringOrEmpty(this, 'url');
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
  }
}

export enum ParameterIn {
  Path = 'path',
  Query = 'query',
  Header = 'header',
}

registerEnumType(ParameterIn, { name: 'ParameterIn' });
