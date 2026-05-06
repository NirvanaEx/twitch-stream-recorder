import { Module } from "@nestjs/common";
import { ArchivesModule } from "./archives/archives.module";
import { AuthModule } from "./auth/auth.module";
import { ChannelsModule } from "./channels/channels.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RecordingModule } from "./recording/recording.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { SettingsModule } from "./settings/settings.module";
import { TwitchModule } from "./twitch/twitch.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    TwitchModule,
    RecordingModule,
    DashboardModule,
    ChannelsModule,
    ArchivesModule,
    SettingsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
