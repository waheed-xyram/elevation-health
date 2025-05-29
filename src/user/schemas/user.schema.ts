import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  _id: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop()
  mobileNumber: string;

  @Prop()
  address: string;

  @Prop()
  roleId: number;

  @Prop()
  token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
