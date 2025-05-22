import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {User} from './schemas/user.schema'

@Injectable()
export class UserService {

  constructor(
    // eslint-disable-next-line prettier/prettier
    @InjectModel(User.name) private readonly userModel: Model<User>
  ){}
  async create(createUserDto: CreateUserDto) {
    const createUser = await this.userModel.create({
      firtName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      mobileNumber: createUserDto.mobileNumber,
      address: createUserDto.address,
      roleId: createUserDto.roleId,
    })
    return createUser.populate(['firstName', 'lastName']);
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
