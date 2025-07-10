import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateStripeDto } from './dto/create-stripe.dto';
import { UpdateStripeDto } from './dto/update-stripe.dto';
import { RoomEntity } from "../room/entities/room.entity";
import process from "process";
import  Stripe from "stripe";
import { UserEntity } from "../user/entities/user.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StripeService {

  private readonly stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('SECRET_KEY'), {
      apiVersion: '2025-04-30.basil',
      // apiVersion: "2025-06-30.basil",

    });
  }
  async createStripeCustomer(userId: string) {
    try {
      const user = await UserEntity.findOneBy({ id: userId });

      if (user && user.stripe_customer_id === null) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        user.stripe_customer_id = customer.id;
        await user.save();
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async createPaymentIntent(id: string, price: string) {
    try {
      const user = await UserEntity.findOneBy({ id: id });

      if (user && user.stripe_customer_id === null) {
        const customer = await this.stripe.customers.create({
          email: user.email,
          name: user.username,
        });
        user.stripe_customer_id = customer.id;
        await user.save();
      }

      const customer_id = user.stripe_customer_id;

      // const amount = parseInt(process.env.MESSAGE_AMOUNT);
      const amount = parseFloat(price);

      if (isNaN(amount) || amount <= 0) {
        throw new BadRequestException('Invalid amount entered.');
      }


      // stripe uses cents/ bani - not dollar/ ron
      const amountInBani = Math.round(amount * 100);

      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amountInBani,
        currency: 'ron',
        customer: customer_id,
        payment_method_types: ['card'],
        payment_method_options: {
          card: {
            setup_future_usage: 'off_session',
          },
        },
        receipt_email: user.email,
      });

      return paymentIntent;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async saveCard(paymentMethod: string, userId: string) {
    try {
      const user = await UserEntity.findOneBy({ id: userId });
      const customerId = user.stripe_customer_id;

      const card = await this.stripe.paymentMethods.attach(paymentMethod, {
        customer: customerId,
      });
      return card;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async getSavedCards(userId: string) {
    try {
      const user = await UserEntity.findOneBy({ id: userId });
      const customerId = user.stripe_customer_id;

      console.log('stripe id');
      console.log(customerId);

      if (customerId !== null) {
        const cards = await this.stripe.paymentMethods.list({
          customer: customerId,
          type: 'card',
        });

        console.log(cards);
        console.log(cards.data);

        return cards;
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
  async updateCustomerEmail(userId: string, newEmail: string) {
    try {
      const user = await UserEntity.findOneBy({ id: userId });
      const customerId = user.stripe_customer_id;

      if (customerId !== null) {
        const customer = await this.stripe.customers.update(customerId, {
          email: newEmail,
        });
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async updateCustomerName(userId: string, username: string) {
    try {
      const user = await UserEntity.findOneBy({ id: userId });
      const customerId = user.stripe_customer_id;

      if (customerId !== null) {
        await this.stripe.customers.update(customerId, {
          name: username,
        });
      } else {
        console.log('this user does not have a stripe account');
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteCustomer(userId: string) {
    try {
      const user = await UserEntity.findOneBy({ id: userId });
      const customerId = user.stripe_customer_id;

      if (customerId !== null) {
        await this.stripe.customers.del(customerId);
      } else {
        console.log('this user does not have a stripe account');
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

}
