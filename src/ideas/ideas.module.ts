import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Idea, IdeaSchema } from './schemas/idea.schema';
import { IdeasService } from './services/ideas.service';
import { IdeasController } from './controllers/ideas.controller';
import { PublicController } from './controllers/public.controller';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Idea.name, schema: IdeaSchema }]),
    forwardRef(() => PaymentsModule)
  ],
  providers: [IdeasService],
  controllers: [IdeasController, PublicController],
  exports: [IdeasService]
})
export class IdeasModule {}