import { Field, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { ApiMethod } from './api-method.model';
import { ApiParameter } from './api-parameter.model';
import { ApiSpec } from './api-spec.model';

@ObjectType()
export class ApiPath {
  @Field()
  path: string;

  @Field(() => [ApiMethod])
  get methods(): ApiMethod[] {
    return Object.keys(this.rawData)
      .filter(ApiMethod.isValidMethod)
      .map((method) => new ApiMethod(this, method, this.rawData[method], this.specService));
  }

  @Field(() => [ApiParameter])
  get parameters(): ApiParameter[] {
    return (this.rawData.parameters ?? []).map((param: any) => new ApiParameter(this, param, this.specService));
  }

  @Field(() => ApiSpec)
  parent: ApiSpec;

  public get namespace(): string[] {
    return [...this.parent.namespace, this.path];
  }

  constructor(parent: ApiSpec, path: string, private rawData: any, private specService: ApiSpecsService) {
    if (rawData.$ref) this.rawData = this.specService.followRef(this.namespace, rawData.$ref);
    this.validateRawData();
    this.parent = parent;
    this.path = path;
  }

  private validateRawData(): void {
    // ToDo
  }
}
