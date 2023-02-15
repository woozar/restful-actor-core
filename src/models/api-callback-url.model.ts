import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { ApiCallback } from './api-callback.model';
import { ApiMethod } from './api-method.model';

@ObjectType()
export class ApiCallbackUrl {
  @Field(() => String)
  url: string;

  @Field(() => [ApiMethod])
   public get methods(): ApiMethod[] {
    return Object.keys(this.rawData)
      .filter(ApiMethod.isValidMethod)
      .map((method) => new ApiMethod(this, method, this.rawData[method], this.specService));
  }

  @Field(() => [String])
   public get namespace(): string[] {
    return [...this.parent.namespace, `url: ${this.url}`];
  }

  @Field(() => ApiCallback)
  public parent: ApiCallback;

  constructor(parent: ApiCallback, url: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(url);
    this.url = url;
  }

  private validateRawData(url: string): void {
    // ToDo
  }
}

export enum ParameterIn {
  Path = 'path',
  Query = 'query',
  Header = 'header',
}

registerEnumType(ParameterIn, { name: 'ParameterIn' });
