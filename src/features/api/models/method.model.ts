import { createUnionType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ApiSpecsService } from '../api-specs.service';
import { Parameter } from './parameter.model';
import { Response } from './response.model';
import { Path } from './path.model';
import { HttpContent } from './http-content.model';
import { Callback } from './callback.model';
import { CallbackUrl } from './callback-url.model';
import { NsError } from '../../../ns-error';

const ApiMethodParent = createUnionType({ name: 'ApiMethodParent', types: /* istanbul ignore next */ () => [Path, CallbackUrl] });

@ObjectType()
export class Method {
  @Field(/* istanbul ignore next */ () => Methods)
  method: Methods;

  @Field()
  public get operationId(): string {
    return this.rawData?.operationId;
  }

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get summary(): string | null {
    return this.rawData.summary ?? null;
  }

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get description(): string | null {
    return this.rawData.description ?? null;
  }

  @Field(/* istanbul ignore next */ () => [HttpContent])
  public get requestBody(): HttpContent[] {
    const { requestBody } = this.rawData;
    return Object.keys(requestBody ?? {}).map((mimetype) => new HttpContent(this, mimetype, requestBody[mimetype], this.specService));
  }

  @Field(/* istanbul ignore next */ () => [Response])
  public get responses(): Response[] {
    return Object.keys(this.rawData.responses).map((code) => new Response(this, code, this.rawData.responses[code], this.specService));
  }

  @Field(/* istanbul ignore next */ () => [Parameter])
  public get parameters(): Parameter[] {
    return this.rawData.parameters?.map((param: any) => new Parameter(this, param, this.specService)) ?? [];
  }

  @Field(/* istanbul ignore next */ () => [Callback])
  public get callbacks(): Callback[] {
    const { callbacks } = this.rawData;
    return Object.keys(callbacks ?? {}).map((name: any) => new Callback(this, name, callbacks[name], this.specService));
  }

  // externalDocs:
  //   url: http://blablabla
  //   description: asd

  @Field(/* istanbul ignore next */ () => ApiMethodParent)
  public parent: Path | CallbackUrl;

  public get namespace(): string[] {
    return [...this.parent.namespace, `method: ${this.operationId} (${this.method})`];
  }

  public static isValidMethod(method: string): method is Methods {
    return Object.values(Methods).includes(method as any);
  }

  constructor(parent: Path | CallbackUrl, method: Methods, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(method);
    this.method = method;
  }

  private validateRawData(method: any): void {
    if (!Method.isValidMethod(method)) throw NsError.invalidEnumValue(this, 'method', method, Object.values(Methods), 'ApiMethod');
    // ToDo check if operationId is spec wide unique
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
    const { operationId, summary, description, responses } = this.rawData;
    if (!operationId || typeof operationId !== 'string') throw NsError.notAStringOrEmpty(this, 'operationId');
    if (summary && typeof summary !== 'string') throw NsError.notNullOrString(this, 'summary');
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
    if (!responses) throw NsError.missingMandatoryProperty(this, 'responses');
    if (typeof responses !== 'object' || Array.isArray(responses)) throw NsError.notARecord(this, 'responses', 'object');
  }
}

export enum Methods {
  get = 'get',
  put = 'put',
  post = 'post',
  delete = 'delete',
  head = 'head',
}

registerEnumType(Methods, { name: 'ApiMethods' });
