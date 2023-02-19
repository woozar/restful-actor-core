import { Field, ObjectType } from '@nestjs/graphql';
import { NsError } from '../../../ns-error';
import { ApiSpecsService } from '../api-specs.service';
import { Method } from './method.model';
import { Parameter } from './parameter.model';
import { ApiSpec } from './spec.model';

@ObjectType()
export class Path {
  @Field()
  path: string;

  @Field(/* istanbul ignore next */ () => [Method])
  public get methods(): Method[] {
    return Object.keys(this.rawData)
      .filter(Method.isValidMethod)
      .map((method) => new Method(this, method, this.rawData[method], this.specService));
  }

  // ToDo server property?

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get summary(): string | null {
    return this.rawData.summary ?? null;
  }

  @Field(/* istanbul ignore next */ () => String, { nullable: true })
  public get description(): string | null {
    return this.rawData.description ?? null;
  }

  @Field(/* istanbul ignore next */ () => [Parameter])
  public get parameters(): Parameter[] {
    return (this.rawData.parameters ?? []).map((param: any) => new Parameter(this, param, this.specService));
  }

  @Field(/* istanbul ignore next */ () => ApiSpec)
  parent: ApiSpec;

  public get namespace(): string[] {
    return [...this.parent.namespace, `path: ${this.path}`];
  }

  constructor(parent: ApiSpec, path: string, private rawData: any, private specService: ApiSpecsService) {
    this.parent = parent;
    if (rawData?.$ref) this.rawData = this.specService.followRef(this, rawData.$ref);
    this.validateRawData(path);
    this.path = path;
  }

  private validateRawData(path: any): void {
    if (path === null || path === undefined || typeof path !== 'string') throw NsError.notAStringOrEmpty(this, 'path');
    if (!/^\/.*$/.test(path)) throw new NsError(this.namespace, `every path must start with a /`);
    // ToDo improve validation logic for path string?
    // check variables?
    if (!this.rawData || typeof this.rawData !== 'object') throw NsError.notAnObject(this);
    const { parameters, description, summary } = this.rawData;
    if (parameters) {
      if (!Array.isArray(parameters)) throw NsError.notAnArray(this, 'parameters');
      for (const parameter of parameters) {
        if (typeof parameter !== 'object') throw NsError.arrayItemWrongType(this, 'parameters', typeof parameter, 'object');
      }
    }
    if (!Object.keys(this.rawData).filter((key) => key !== 'parameters').length)
      throw new NsError(this.namespace, `every path needs to contain at least one method`);
    for (const key of Object.keys(this.rawData)) {
      if (!['parameters', 'summary', 'description'].includes(key) && !Method.isValidMethod(key)) throw NsError.unexpectedProperty(this, key);
    }
    if (description && typeof description !== 'string') throw NsError.notNullOrString(this, 'description');
    if (summary && typeof summary !== 'string') throw NsError.notNullOrString(this, 'summary');
  }
}
