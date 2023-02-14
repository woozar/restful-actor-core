import { Field, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NamespaceError } from 'src/namespace-error';
import { ApiSpec } from './api-spec.model';

@ObjectType()
export class ApiServer {
  @Field(() => String, { nullable: true })
  get description(): string {
    return this.rawData.description ?? null;
  }

  @Field(() => String)
  get url(): string {
    return this.rawData.url;
  }

  // ToDo
  // @Field(() => [ApiVariable])
  // get variables(): ApiVariable[] {
  // https://swagger.io/docs/specification/api-host-and-base-path/
  // - url: /{bla}/api
  // description: local debug
  // variables:
  //   bla:
  //     enum:
  //       - horst
  //       - seehofer
  //     default: horst
  @Field(() => [String])
  get variables(): string[] {
    return (this.rawData.variables ?? []).map((item: any) => JSON.stringify(item));
  }

  @Field(() => [String])
  public get namespace(): string[] {
    return [...(this.parent?.namespace ?? []), this.url];
  }

  constructor(public parent: ApiSpec, private rawData: any, private specService: ApiSpecsService) {
    if (rawData.$ref) this.rawData = this.specService.followRef(this.namespace, rawData.$ref);
    this.validateRawData();
  }

  private validateRawData(): void {
    const { url } = this.rawData;
    if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      throw new NamespaceError([...this.namespace, 'servers', url ?? ''], 'url must be a string that starts with http:// or https://');
    }
    // ToDo
  }
}
