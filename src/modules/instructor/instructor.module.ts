import { Module } from '@nestjs/common';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';

@Module({
  controllers: [InstructorController],
  providers: [InstructorService]
})
export class InstructorModule {}
