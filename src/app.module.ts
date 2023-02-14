import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApiSpecResolver } from './api-specs.resolver';
import { ApiSpecsService } from './api-specs.service';
import { ServerConfig } from './config';
import { SchemaService } from './schema.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: ServerConfig.debug,
      playground: ServerConfig.debug,
      autoSchemaFile: true,
      sortSchema: true,
    }),
  ],
  controllers: [],
  providers: [ApiSpecsService, SchemaService, ApiSpecResolver],
})
export class AppModule {}
