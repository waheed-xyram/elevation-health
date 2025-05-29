export interface IUserAuthentication {
  _id: string;
  email: string;
}

export interface IUserDetails extends IUserAuthentication {
  firstName: string;
  lastName: string;
  roleId: number;
}
