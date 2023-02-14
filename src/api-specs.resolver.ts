import { Args, Query, Resolver } from '@nestjs/graphql';
import { ApiSpecsService } from './api-specs.service';
import { ApiSpec } from './models/api-spec.model';

@Resolver((_of: any) => ApiSpec)
export class ApiSpecResolver {
  constructor(private apiSpecs: ApiSpecsService) {}

  @Query(() => ApiSpec)
  async getApiSpec(@Args('id', { type: () => String }) id: string): Promise<ApiSpec> {
    const spec = this.apiSpecs.getApiSpecById(id);
    if (!spec) throw new Error(`Cannot find id ${id}`);
    return spec;
  }

  @Query(() => [ApiSpec])
  async getApiSpecs(): Promise<ApiSpec[]> {
    return this.apiSpecs.getApiSpecs();
  }
}
