import {
  Entity,
  Column,
  ObjectIdColumn,
  ObjectId,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Department {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "text" })
  code!: string;

  @Column({ type: "text", unique: true })
  slug!: string;

  // store admin id as text (stringified ObjectId)
  @Column({ type: "text" })
  adminId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
