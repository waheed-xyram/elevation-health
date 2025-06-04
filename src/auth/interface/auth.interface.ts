import { ObjectId } from 'mongoose';

export interface IUserAuthentication {
  _id?: string | ObjectId;
  email: string;
}

export interface IUserDetails extends IUserAuthentication {
  firstName: string;
  lastName: string;
  roleId: number;
}
