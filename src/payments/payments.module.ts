import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './services/payments.service';
import { PaymentsController } from './payments.controller';
import { IdeasModule } from 'src/ideas/ideas.module';

@Module({
  imports: [forwardRef(() => IdeasModule)],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService]
})
export class PaymentsModule {}