import { Inject, Injectable } from '@nestjs/common';
import { ModelClass } from 'objection';
import { UserModel } from 'src/database/models/user.model';
import { GET_OPTIONS } from 'src/database/modifiers';
import { SignUpDto } from './dto/signup.dto';
import { UserGetOptionsDto } from './dto/userGetOptions.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@Inject('UserModel') private userModel: ModelClass<UserModel>) {}

  async getById(id: number): Promise<UserModel | undefined> {
    return await this.userModel
      .query()
      .findById(id)
      .select('id', 'username', 'level', 'xp');
  }

  async getByNameWithPassword(
    username: string,
  ): Promise<UserModel | undefined> {
    return await this.userModel.query().where({ username }).first();
  }

  async getByName(username: string): Promise<UserModel | undefined> {
    return await this.userModel
      .query()
      .select('id', 'username', 'level', 'xp')
      .where({ username })
      .first();
  }

  async getAll(options?: UserGetOptionsDto): Promise<UserModel[]> {
    const query = this.userModel
      .query()
      .select('id', 'username', 'level', 'xp');
    if (options) query.modify(GET_OPTIONS, options);
    return await query;
  }

  async create(body: SignUpDto): Promise<UserModel> {
    const user = {} as any;
    user.password = await bcrypt.hash(body.password, 12);
    user.username = body.username;
    return await this.userModel.query().insert(user).returning('*');
  }

  async addXP(id: number, XP: number): Promise<UserModel> {
    const user = await this.userModel
      .query()
      .findById(id)
      .select('id', 'username', 'level', 'xp');
    if (!user) throw new Error('User not found');

    const total = user.xp + XP;
    const level = Math.floor((Math.sqrt(625 + 100 * total) - 25) / 50);
    await user.$query().patch({
      xp: total,
      level,
    });
    return user;
  }
}
