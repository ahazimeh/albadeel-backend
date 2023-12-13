import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Brand } from "./Brand";
import { Alternative } from "./Alternative";

@Entity()
export class AlternativeSearch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  url: string;

  @ManyToOne(() => Alternative, (alternative) => alternative.id)
  @JoinColumn({ name: "alternative_search_id" })
  alternative: Alternative;

  @Column({ default: false })
  completed: boolean;
}
