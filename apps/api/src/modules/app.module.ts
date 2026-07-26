import { Module } from "@nestjs/common";
import { ArchivesModule } from "./archives/archives.module";
import { ChatModule } from "./chat/chat.module";
import { AuthModule } from "./auth/auth.module";
import { ChannelsModule } from "./channels/channels.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { PublicModule } from "./public/public.module";
import { RecordingModule } from "./recording/recording.module";
import { RealtimeModule } from "./realtime/realtime.module";
import { SettingsModule } from "./settings/settings.module";
import { StorageModule } from "./storage/storage.module";
import { TelegramModule } from "./telegram/telegram.module";
import { KickModule } from "./kick/kick.module";
import { PlatformsModule } from "./platforms/platforms.module";
import { TwitchModule } from "./twitch/twitch.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    TwitchModule,
    KickModule,
    PlatformsModule,
    ChatModule,
    RecordingModule,
    DashboardModule,
    ChannelsModule,
    ArchivesModule,
    PublicModule,
    SettingsModule,
    StorageModule,
    TelegramModule,
    RealtimeModule,
  ],
})
export class AppModule {}
