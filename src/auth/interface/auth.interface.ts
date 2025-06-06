import { ObjectId } from 'mongoose';

export interface IUserAuthentication {
  _id?: string | ObjectId;
  email: string;
  roleId?: number;
}

export interface IUserDetails extends IUserAuthentication {
  firstName: string;
  lastName: string;
}
