import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { APP_GUARD } from "@nestjs/core";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JWT_TTL_SECONDS } from "./auth.constants";

@Global()
@Module({
  imports: [
    JwtModule.register({
      // Lazy fallback for dev: any non-empty string still works.
      secret: process.env.JWT_SECRET || "dev-secret-change-me",
      signOptions: { expiresIn: JWT_TTL_SECONDS },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
