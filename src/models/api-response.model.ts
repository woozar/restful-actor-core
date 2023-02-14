import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NamespaceError } from 'src/namespace-error';
import { ApiMethod } from './api-method.model';

@ObjectType()
export class ApiResponse {
  @Field(() => Int)
  code: number;

  @Field(() => String, { nullable: true })
  get description(): string | null {
    return this.rawData.description ?? null;
  }

  public get namespace(): string[] {
    return [...this.parent.namespace, `${this.code}`];
  }

  constructor(private parent: ApiMethod, code: string | number, private rawData: any, private specService: ApiSpecsService) {
    if (rawData.$ref) this.rawData = this.specService.followRef(this.namespace, rawData.$ref);
    this.validateRawData(code);
    this.code = typeof code === 'string' ? Number.parseInt(code, 10) : code;
  }

  private validateRawData(code: any): void {
    if (typeof code !== 'number' && (typeof code !== 'string' || Number.isNaN(Number.parseInt(code, 10)))) {
      throw new NamespaceError(this.namespace, `code must be a number or an integer serialized as string`);
    }
    if (this.rawData.description !== undefined && typeof this.rawData.description !== 'string') {
      throw new NamespaceError(this.namespace, `typeof description must be string?`);
    }
    // ToDo
  }
}
