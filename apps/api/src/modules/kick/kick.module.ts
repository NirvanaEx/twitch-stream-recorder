import { Module } from "@nestjs/common";
import { KickService } from "./kick.service";

@Module({
  providers: [KickService],
  exports: [KickService],
})
export class KickModule {}
