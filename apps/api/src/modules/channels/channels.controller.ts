import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CreateChannelDto } from "./dto/create-channel.dto";
import { UpdateChannelDto } from "./dto/update-channel.dto";
import { ChannelsService } from "./channels.service";

@Controller("channels")
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {
    this.listChannels = this.listChannels.bind(this);
    this.createChannel = this.createChannel.bind(this);
    this.updateChannel = this.updateChannel.bind(this);
    this.deleteChannel = this.deleteChannel.bind(this);
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.syncChannel = this.syncChannel.bind(this);
  }

  @Get()
  listChannels() {
    return this.channelsService.listChannels();
  }

  @Post()
  createChannel(@Body() dto: CreateChannelDto) {
    return this.channelsService.createChannel(dto);
  }

  @Patch(":id")
  updateChannel(@Param("id") id: string, @Body() dto: UpdateChannelDto) {
    return this.channelsService.updateChannel(id, dto);
  }

  @Post(":id/start")
  startRecording(@Param("id") id: string) {
    return this.channelsService.startRecording(id);
  }

  @Post(":id/stop")
  stopRecording(@Param("id") id: string) {
    return this.channelsService.stopRecording(id);
  }

  @Post(":id/sync")
  syncChannel(@Param("id") id: string) {
    return this.channelsService.syncChannel(id);
  }

  @Delete(":id")
  deleteChannel(@Param("id") id: string) {
    return this.channelsService.deleteChannel(id);
  }
}
