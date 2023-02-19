import { Args, Query, Resolver } from '@nestjs/graphql';
import { ApiSpecsService } from './api-specs.service';
import { ApiSpec } from './models/spec.model';

@Resolver(/* istanbul ignore next */ () => ApiSpec)
export class ApiSpecResolver {
  constructor(private apiSpecs: ApiSpecsService) {}

  @Query(/* istanbul ignore next */ () => ApiSpec)
  async getApiSpec(@Args('id', { type: /* istanbul ignore next */ () => String }) id: string): Promise<ApiSpec> {
    const spec = this.apiSpecs.getApiSpecById(id);
    if (!spec) throw new Error(`Cannot find id ${id}`);
    return spec;
  }

  @Query(/* istanbul ignore next */ () => [ApiSpec])
  async getApiSpecs(): Promise<ApiSpec[]> {
    return this.apiSpecs.getApiSpecs();
  }
}
