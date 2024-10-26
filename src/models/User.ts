import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript'

@Table({ tableName: 'users' })
export class User extends Model {
  @Column({
    type: DataType.BIGINT,
    primaryKey: true,
    unique: true,
  })
  id!: number

  @Column({
    type: DataType.STRING,
    defaultValue: 'en',
  })
  language!: string

  @CreatedAt
  createdAt!: Date

  @UpdatedAt
  updatedAt!: Date

  static async findOrCreateUser(id: number) {
    const [user] = await User.findOrCreate({
      where: { id },
    })
    return user
  }
}

export const findOrCreateUser = (id: number) => User.findOrCreateUser(id)
