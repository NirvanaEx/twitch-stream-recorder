import { Controller, Get } from "@nestjs/common";

@Controller("auth")
export class AuthController {
  constructor() {
    this.getCurrentUser = this.getCurrentUser.bind(this);
  }

  @Get("me")
  getCurrentUser() {
    return {
      user: {
        username: process.env.ADMIN_USERNAME ?? "admin",
      },
      authenticated: false,
      note: "Authentication flow is not implemented yet.",
    };
  }
}
