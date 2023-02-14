import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NamespaceError } from 'src/namespace-error';
import { ApiParameter } from './api-parameter.model';
import { ApiResponse } from './api-response.model';
import { ApiPath } from './api-path.model';

@ObjectType()
export class ApiMethod {
  @Field(() => Method)
  method: Method;

  @Field()
  get operationId(): string {
    return this.rawData.operationId;
  }

  @Field(() => String, { nullable: true })
  get description(): string | null {
    return this.rawData.description ?? null;
  }

  @Field(() => [ApiResponse])
  get responses(): ApiResponse[] {
    return Object.keys(this.rawData.responses).map((code) => new ApiResponse(this, code, this.rawData.responses[code], this.specService));
  }

  @Field(() => [ApiParameter])
  get parameters(): ApiParameter[] {
    return this.rawData.parameters?.map((param: any) => new ApiParameter(this, param, this.specService)) ?? [];
  }

  @Field(() => ApiPath)
  public parent: ApiPath;

  public get namespace(): string[] {
    return [...this.parent.namespace, `${this.operationId} (${this.method})`];
  }

  public static isValidMethod(method: string): method is Method {
    return Object.keys(Method).includes(method);
  }

  constructor(parent: ApiPath, method: Method, private rawData: any, private specService: ApiSpecsService) {
    if (rawData.$ref) this.rawData = this.specService.followRef(this.namespace, rawData.$ref);
    this.validateRawData(method);
    this.parent = parent;
    this.method = method;
  }

  private validateRawData(method: any): void {
    if (!ApiMethod.isValidMethod(method)) throw new NamespaceError(this.namespace, `${method} is not a valid method`);
    // ToDo check if operationId is spec wide unique
    if (!this.rawData.operationId || typeof this.rawData.operationId !== 'string') {
      throw new NamespaceError(this.namespace, `operationId ${this.rawData.operationId} is not a valid string`);
    }
  }
}

export enum Method {
  get = 'get',
  put = 'put',
  post = 'post',
  delete = 'delete',
  head = 'head',
}

registerEnumType(Method, { name: 'Method' });
