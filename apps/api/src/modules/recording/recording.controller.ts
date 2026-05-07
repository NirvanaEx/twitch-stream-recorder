import { Controller, Get } from "@nestjs/common";
import { RequirePermissions } from "../auth/auth.decorators";
import { RecordingService } from "./recording.service";

@RequirePermissions("view_recording")
@Controller("recording")
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {
    this.getActiveRecordings = this.getActiveRecordings.bind(this);
  }

  @Get("active")
  getActiveRecordings() {
    return this.recordingService.getActiveRecordings();
  }
}
