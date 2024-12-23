import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { Log } from 'src/database/schemas/log.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Logs')
@Controller('logs')
@ApiBearerAuth()
export class LogsController {
constructor(private readonly logsService: LogsService) {}

@Post()
@Public()
@ApiOperation({ summary: 'Add a new log' })
@ApiResponse({ status: 201, description: 'Log added successfully' })
@ApiBody({ 
    type: Log,
    examples: {
        example1: {
            summary: 'Example log',
            value: {
                event: 'This is a log message',
                status: 200,
                timestamp: new Date().toISOString(),
                type: 'general'
            }
        }
    }
})
async addLog(@Body() logData: Partial<Log>) {
    return this.logsService.addLog(logData);
}

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Get all logs' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  async getLogs() {
    return this.logsService.getLogs();
  }
}
