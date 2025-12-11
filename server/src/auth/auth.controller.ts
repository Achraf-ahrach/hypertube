import { Controller, Post, UseGuards, Res, Request, Get } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // 1. Login Route
  @UseGuards(AuthGuard('local')) // Validates username/password first
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) response: Response) {
    const { access_token } = await this.authService.login(req.user);

    // Set the Cookie
    response.cookie('Authentication', access_token, {
      httpOnly: true, // Frontend JS cannot read this
      secure: false,  // Set to TRUE if using HTTPS (Production)
      sameSite: 'lax',
      expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
    });

    return { message: 'Success' };
  }

  // 2. Profile Route (Protected)
  @UseGuards(AuthGuard('jwt')) // Checks for the Cookie
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
  
  // 3. Logout
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('Authentication');
    return { message: 'Logged out' };
  }
}