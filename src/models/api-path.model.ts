import { Field, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NsError } from 'src/ns-error';
import { ApiMethod } from './api-method.model';
import { ApiParameter } from './api-parameter.model';
import { ApiSpec } from './api-spec.model';

@ObjectType()
export class ApiPath {
  @Field()
  path: string;

  @Field(() => [ApiMethod])
  public get methods(): ApiMethod[] {
    return Object.keys(this.rawData)
      .filter(ApiMethod.isValidMethod)
      .map((method) => new ApiMethod(this, method, this.rawData[method], this.specService));
  }

  @Field(() => [ApiParameter])
  public get parameters(): ApiParameter[] {
    return (this.rawData.parameters ?? []).map((param: any) => new ApiParameter(this, param, this.specService));
  }

  @Field(() => ApiSpec)
  parent: ApiSpec;

   public get namespace(): string[] {
    return [...this.parent.namespace, `path: ${this.path}`];
  }

  constructor(parent: ApiSpec, path: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(path);
    this.path = path;
  }

  private validateRawData(path: any): void {
    const { parameters } = this.rawData;
    if (!parameters) return;
    if (!Array.isArray(parameters)) throw NsError.notAnArray(this, 'parameters');
    for (const parameter of parameters) {
      if (typeof parameter !== 'object') throw NsError.arrayItemWrongType(this, 'parameters', typeof parameter, 'object');
    }
    for (const key of Object.keys(this.rawData)) {
      if (key !== 'parameters' && !ApiMethod.isValidMethod(key)) throw NsError.unexpectedProperty(this, key);
    }
  }
}
