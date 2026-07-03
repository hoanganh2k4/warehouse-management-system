import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { TransactionQueryDto } from './dto/transaction.dto';
import {
  ApiAuthReadErrors,
  ApiSuccessExample,
  ApiValidationError,
} from '../common/decorators/api-responses.decorator';
import { SUCCESS_EXAMPLES } from '../common/swagger/swagger-examples';

@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  @ApiSuccessExample(SUCCESS_EXAMPLES.transactionList, '200 OK — Lịch sử giao dịch')
  @ApiValidationError()
  @ApiAuthReadErrors()
  findAll(@Query() query: TransactionQueryDto) {
    return this.service.findAll(query);
  }
}
