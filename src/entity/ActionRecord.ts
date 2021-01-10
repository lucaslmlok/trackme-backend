import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

import { Action } from "./Action";

@Entity({ name: "action-records" })
export class ActionRecord {
  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: ["yesNo", "number"],
    default: "yesNo",
  })
  type: string;

  @Column({ type: "int", default: 1 })
  target: number;

  @Column({ default: "unit" })
  unit: string;

  @Column({ type: "int", default: 1 })
  increment: number;

  @Column({ type: "int", default: 1 })
  done: number;

  @Column()
  color: string;

  @Column()
  icon: string;

  @Column({ type: "date" })
  date: Date;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  DeleteAt: Date;

  @Column()
  actionId: number;

  @ManyToOne(() => Action, (action) => action.records, { nullable: false })
  @JoinColumn({ name: "actionId" })
  action: Promise<Action>;
}
