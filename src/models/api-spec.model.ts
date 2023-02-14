import { Field, ObjectType } from '@nestjs/graphql';
import { ApiSpecsService } from 'src/api-specs.service';
import { NamespaceError } from 'src/namespace-error';
import { ApiPath as ApiPath } from './api-path.model';
import { ApiServer } from './api-server.model';

@ObjectType()
export class ApiSpec {
  get openApi() {
    return this.rawData.openapi;
  }

  @Field()
  id: string;

  @Field()
  get name(): string {
    return this.rawData.info.version ? `${this.rawData.info.title} ${this.rawData.info.version}` : this.rawData.info.title;
  }

  @Field(() => [ApiServer])
  get servers(): ApiServer[] {
    return this.rawData.servers?.map((server: any) => new ApiServer(this, server, this.specService)) ?? [];
  }

  @Field(() => [ApiPath])
  get paths(): ApiPath[] {
    return Object.keys(this.rawData.paths ?? {}).map((path) => new ApiPath(this, path, this.rawData.paths[path], this.specService));
  }

  public get namespace(): string[] {
    return [this.id];
  }

  constructor(id: string, private rawData: any, private specService: ApiSpecsService) {
    if (rawData.$ref) this.rawData = this.specService.followRef(this.namespace, rawData.$ref);
    this.validateRawData();
    this.id = id;
  }

  private validateRawData(): void {
    if (!this.rawData.info.title || typeof this.rawData.info.title !== 'string') throw new NamespaceError(this.namespace, 'missing info.title or not a string');
    if (this.rawData.openapi && !['3.0.0', '3.0.1', '3.0.2', '3.0.3'].includes(this.rawData.openapi)) {
      throw new NamespaceError(this.namespace, 'openapi is not a valid version');
    }
    // ToDo
  }
}
