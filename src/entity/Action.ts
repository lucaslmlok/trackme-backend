import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ActionRecord } from "./ActionRecord";

import { User } from "./User";

export type ActionType = "yesNo" | "number";

export const isActionType = (input: string) => {
  return input === "yesNo" || input === "number";
};

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

@Entity({ name: "actions" })
export class Action {
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

  @Column()
  color: string;

  @Column()
  icon: string;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date", nullable: true })
  endDate: Date;

  @Column("simple-array")
  weekdays: Weekday[];

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  DeleteAt: Date;

  @ManyToOne(() => User, (user) => user.actions, { nullable: false })
  user: Promise<User>;

  @OneToMany(() => ActionRecord, (record) => record.action)
  records: Promise<ActionRecord[]>;
}
