import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NsError } from 'src/ns-error';
import { ApiMethod } from './api-method.model';
import { HttpContent } from './http-content.model';
import { HttpHeader } from './http-header.model';

@ObjectType()
export class ApiResponse {
  @Field(() => Int)
  code: number;

  @Field(() => String, { nullable: true })
  public get description(): string | null {
    return this.rawData.description ?? null;
  }

  @Field(() => ApiMethod)
  public parent: ApiMethod;

  @Field(() => [HttpHeader])
   public get headers(): HttpHeader[] {
    const { headers } = this.rawData;
    return Object.keys(headers ?? {}).map((header) => new HttpHeader(this, header, headers[header], this.specService));
  }

  @Field(() => [HttpContent])
   public get contents(): HttpContent[] {
    const { content } = this.rawData;
    return Object.keys(content ?? {}).map((mimetype) => new HttpContent(this, mimetype, content[mimetype], this.specService));
  }

   public get namespace(): string[] {
    return [...this.parent.namespace, `response: ${this.code}`];
  }

  constructor(parent: ApiMethod, code: string | number, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(code);
    this.code = typeof code === 'string' ? Number.parseInt(code, 10) : code;
  }

  private validateRawData(code: any): void {
    if (typeof code !== 'number' && (typeof code !== 'string' || Number.isNaN(Number.parseInt(code, 10)))) {
      throw new NsError(this.namespace, `code must be a number or an integer serialized as string`);
    }
    const { description } = this.rawData;
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
  }
}
