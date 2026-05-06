import { Controller, Get } from "@nestjs/common";
import { RecordingService } from "./recording.service";

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
