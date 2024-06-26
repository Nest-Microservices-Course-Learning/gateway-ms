import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderPaginationDto, PaginationDto } from 'src/common';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
import { StatusDto } from './dto/status.dto';
import { CreateOrderDto } from './dto';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {}

  @Get()
  async findAll(@Query() orderPaginationDto: OrderPaginationDto) {
    try {
      const orders = await firstValueFrom(
        this.client.send('findAllOrders', orderPaginationDto),
      );
      return orders;
    } catch (error) {
      console.log(error);
      throw new RpcException(error);
    }
  }

  @Get('/:status')
  async findAllStatusParam(
    @Query() paginationDto: PaginationDto,
    @Param() statusDto: StatusDto,
  ) {
    try {
      const order = await firstValueFrom(
        this.client.send('findAllOrders', {
          ...statusDto,
          ...paginationDto,
        }),
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('/id/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      const order = await firstValueFrom(
        this.client.send('findOneOrder', {
          id: id,
        }),
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    try {
      return this.client.send('createOrder', createOrderDto);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('/:id')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: StatusDto,
  ) {
    try {
      const order = await firstValueFrom(
        this.client.send('changeStatusOrder', { id, ...statusDto }),
      );
      return order;
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
