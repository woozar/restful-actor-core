import { createUnionType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NsError } from 'src/ns-error';
import { ApiParameter } from './api-parameter.model';
import { ApiResponse } from './api-response.model';
import { ApiPath } from './api-path.model';
import { HttpContent } from './http-content.model';
import { ApiCallback } from './api-callback.model';
import { ApiCallbackUrl } from './api-callback-url.model';

const ApiMethodParent = createUnionType({ name: 'ApiMethodParent', types: () => [ApiPath, ApiCallbackUrl] });

@ObjectType()
export class ApiMethod {
  @Field(() => Method)
  method: Method;

  @Field()
  public get operationId(): string {
    return this.rawData.operationId;
  }

  @Field(() => String, { nullable: true })
  public get summary(): string | null {
    return this.rawData.summary ?? null;
  }

  @Field(() => String, { nullable: true })
  public get description(): string | null {
    return this.rawData.description ?? null;
  }

  @Field(() => [HttpContent])
  public get requestBody(): HttpContent[] {
    const { requestBody } = this.rawData;
    return Object.keys(requestBody ?? {}).map((mimetype) => new HttpContent(this, mimetype, requestBody[mimetype], this.specService));
  }

  @Field(() => [ApiResponse])
  public get responses(): ApiResponse[] {
    return Object.keys(this.rawData.responses).map((code) => new ApiResponse(this, code, this.rawData.responses[code], this.specService));
  }

  @Field(() => [ApiParameter])
  public get parameters(): ApiParameter[] {
    return this.rawData.parameters?.map((param: any) => new ApiParameter(this, param, this.specService)) ?? [];
  }

  @Field(() => [ApiCallback])
  public get callbacks(): ApiCallback[] {
    const { callbacks } = this.rawData;
    return Object.keys(callbacks ?? {}).map((name: any) => new ApiCallback(this, name, callbacks[name], this.specService)) ?? [];
  }

  // externalDocs:
  //   url: http://blablabla
  //   description: asd

  @Field(() => ApiMethodParent)
  public parent: ApiPath | ApiCallbackUrl;

  public get namespace(): string[] {
    return [...this.parent.namespace, `method: ${this.operationId} (${this.method})`];
  }

  public static isValidMethod(method: string): method is Method {
    return Object.keys(Method).includes(method);
  }

  constructor(parent: ApiPath | ApiCallbackUrl, method: Method, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(method);
    this.method = method;
  }

  private validateRawData(method: any): void {
    if (!ApiMethod.isValidMethod(method)) throw new NsError(this.namespace, `${method} is not a valid method`);
    // ToDo check if operationId is spec wide unique
    if (!this.rawData.operationId || typeof this.rawData.operationId !== 'string') {
      throw new NsError(this.namespace, `operationId ${this.rawData.operationId} is not a valid string`);
    }
    const { summary, description } = this.rawData;
    if (summary && typeof summary !== 'string') throw NsError.notNullOrString(this, 'summary');
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
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
