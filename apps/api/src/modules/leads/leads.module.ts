import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { OutboxModule } from '../outbox/outbox.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [OutboxModule, EmailModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}

