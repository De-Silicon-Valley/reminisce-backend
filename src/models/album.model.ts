import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Album{
    @ObjectIdColumn()
    _id!: ObjectId;

    @Column({ type: "text" })
    albumName!: string;

    @Column({ type: "text", nullable: true })
    coverImage?: string;

    @Column({ type: "text" })
    workspaceName!: string;

    @ObjectIdColumn()
    departmentId!: ObjectId;

    @Column({ type: "text" })
    workspace!: string;

    @Column("boolean", { default: true })
    isActive: boolean = true;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
