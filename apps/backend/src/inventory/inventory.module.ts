import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { SlotScoringService } from '../common/services/slot-scoring.service';
import { SlotCapacityService } from '../common/services/slot-capacity.service';
import { FefoService } from '../common/services/fefo.service';

@Module({
  controllers: [InventoryController],
  providers: [
    InventoryService,
    SlotScoringService,
    SlotCapacityService,
    FefoService,
  ],
  exports: [InventoryService],
})
export class InventoryModule {}
