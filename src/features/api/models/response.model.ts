import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from '../api-specs.service';
import { Method } from './method.model';
import { HttpContent } from './http-content.model';
import { HttpHeader } from './http-header.model';
import { NsError } from '../../../ns-error';

@ObjectType()
export class Response {
  @Field(/* istanbul ignore next */ () => Int)
  code: number;

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get summary(): string | null {
    return this.rawData.summary ?? null;
  }

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get description(): string | null {
    return this.rawData.description ?? null;
  }

  @Field(/* istanbul ignore next */ () => Method)
  public parent: Method;

  @Field(/* istanbul ignore next */ () => [HttpHeader])
  public get headers(): HttpHeader[] {
    const { headers } = this.rawData;
    return Object.keys(headers ?? {}).map((header) => new HttpHeader(this, header, headers[header], this.specService));
  }

  @Field(/* istanbul ignore next */ () => [HttpContent])
  public get contents(): HttpContent[] {
    const { content } = this.rawData;
    return Object.keys(content ?? {}).map((mimetype) => new HttpContent(this, mimetype, content[mimetype], this.specService));
  }

  public get namespace(): string[] {
    return [...this.parent.namespace, `response: ${this.code}`];
  }

  constructor(parent: Method, code: string | number, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(code);
    this.code = typeof code === 'string' ? Number.parseInt(code, 10) : code;
  }

  private validateRawData(code: any): void {
    if (typeof code !== 'number' && (typeof code !== 'string' || Number.isNaN(Number.parseInt(code, 10)))) {
      throw new NsError(this.namespace, `code must be a number or an integer serialized as string`);
    }
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
    const { description, summary, content } = this.rawData;
    if (summary && typeof summary !== 'string') throw NsError.notNullOrString(this, 'summary');
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
    if (content !== undefined && content !== null && (typeof content !== 'object' || Array.isArray(content)))
      throw NsError.notARecord(this, 'content', 'object');
  }
}
