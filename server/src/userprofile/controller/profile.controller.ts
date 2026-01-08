
// src/users/users.controller.ts
import { Controller, Patch, Body, Req, Query, UseGuards, Get } from '@nestjs/common';
import type { Request } from 'express';
import { userProfileService } from '../service/userProfile.service';
import { AuthGuard } from '@nestjs/passport';


@Controller('profile')
export class UsersProfileController {
    constructor(
        private userProfileService: userProfileService
    ) { }

    // @UseGuards(AuthGuard('jwt'))
    @Get('movies')
    async getProfileComments(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Req() request: Request,
    )
    {
        return this.userProfileService.getUserWatchedMovies
        (
            1,
            page,
            limit
        )
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('comments')
    async updateSettings(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Req() request: Request,
    )
    {
        return this.userProfileService.getUserComments(
            (request.user as any).id,
            page,
            limit
        )
    }



}

