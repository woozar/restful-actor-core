import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ServerConfig } from './config';
import { ApiModule } from './features/api/api.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { SchemaService } from './schema.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      debug: ServerConfig.debug,
      playground: ServerConfig.debug,
      autoSchemaFile: true,
      sortSchema: true,
      subscriptions: {
        'graphql-ws': true,
        // {
        //   path: '/subscriptions',
        //   // onConnect: (context: Context) => {
        //   //   const { connectionParams, subscriptions } = context;
        //   //   console.log(`connectionParams: ${connectionParams}, subscriptions: ${JSON.stringify(subscriptions)}}, context ${JSON.stringify(context)}`);
        //   // },
        //   // onDisconnect: (context: Context) => {
        //   //   const { connectionParams, subscriptions } = context;
        //   //   console.log(
        //   //     `connectionParams: ${JSON.stringify(connectionParams)}}, subscriptions: ${JSON.stringify(subscriptions)}, context ${JSON.stringify(context)}`,
        //   //   );
        //   // },
        // },
      },
    }),
    ApiModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [SchemaService],
})
export class AppModule {}
