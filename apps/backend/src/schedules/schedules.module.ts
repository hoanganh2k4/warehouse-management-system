import { Module } from '@nestjs/common';
import { SchedulesController } from './schedules.controller';
import { SchedulesService } from './schedules.service';
import { SlotScoringService } from '../common/services/slot-scoring.service';
import { SlotCapacityService } from '../common/services/slot-capacity.service';
import { FefoService } from '../common/services/fefo.service';

@Module({
  controllers: [SchedulesController],
  providers: [
    SchedulesService,
    SlotScoringService,
    SlotCapacityService,
    FefoService,
  ],
  exports: [SchedulesService],
})
export class SchedulesModule {}
