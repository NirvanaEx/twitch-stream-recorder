import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { RequirePermissions } from "../auth/auth.decorators";
import { CreateRoleDto, UpdateRoleDto } from "./dto";
import { UsersService } from "./users.service";

@RequirePermissions("manage_roles")
@Controller("roles")
export class RolesController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list() {
    return this.usersService.listRoles();
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.usersService.createRole(dto);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.usersService.deleteRole(id);
  }
}
