import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { ApiCallbackUrl } from './api-callback-url.model';
import { ApiMethod } from './api-method.model';

@ObjectType()
export class ApiCallback {
  @Field(() => String)
  name: string;

  @Field(() => [ApiCallbackUrl])
  public get urls(): ApiCallbackUrl[] {
    return Object.keys(this.rawData).map((url) => new ApiCallbackUrl(this, url, this.rawData[url], this.specService));
  }

  @Field(() => [String])
  public get namespace(): string[] {
    return [...this.parent.namespace, `callback: ${this.name}`];
  }

  @Field(() => ApiMethod)
  public parent: ApiMethod;

  constructor(parent: ApiMethod, name: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(name);
    this.name = name;
  }

  private validateRawData(name: string): void {
    // ToDo
  }
}

export enum ParameterIn {
  Path = 'path',
  Query = 'query',
  Header = 'header',
}

registerEnumType(ParameterIn, { name: 'ParameterIn' });
