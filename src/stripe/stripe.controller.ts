import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, UseGuards } from "@nestjs/common";
import { StripeService } from './stripe.service';
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { LoginGuard } from "../auth/guards/login.guards";
import { StripeIdGuard } from "../auth/guards/stripe-id.guard";

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(LoginGuard)
  @UseGuards(StripeIdGuard)
  @Post('create-stripe-customer/:id')
  async createStripeCustomer(@Res() res, @Param('id') id: string) {
    try {
      const mediaOffer = await this.stripeService.createStripeCustomer(id);
      return res.status(HttpStatus.CREATED).json(mediaOffer);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(StripeIdGuard)
  @Post('create-pay-intent/:id')
  async paymentIntent(@Res() res, @Param('id') id: string, body: {amount: string}) {
    try {
      const createPaymentIntent = await this.stripeService.createPaymentIntent(
        id,
        body.amount,
      );
      return res.status(HttpStatus.CREATED).json(createPaymentIntent);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(StripeIdGuard)
  @Post('attach-card/:paymentMethodId/:id')
  async saveCard(
    @Res() res,
    @Param('paymentMethodId') paymentMethodId: string,
    @Param('id') userId: string,
  ) {
    try {
      const saveCard = await this.stripeService.saveCard(
        paymentMethodId,
        userId,
      );
      return res.status(HttpStatus.CREATED).json(saveCard);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }

  @UseGuards(LoginGuard)
  @UseGuards(StripeIdGuard)
  @Get('get-saved-card/:id')
  async getSavedCard(@Res() res, @Param('id') id: string) {
    try {
      const cards = await this.stripeService.getSavedCards(id);
      return res.status(HttpStatus.CREATED).json(cards);
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json(e);
    }
  }


}
