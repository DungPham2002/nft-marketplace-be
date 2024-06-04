import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env`,
            load: [],
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigurationModule {}
