import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Product } from "./Product";
import { ProductAlternative } from "./ProductAlternative";

@Entity()
export class Alternative extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(
    (type) => ProductAlternative,
    (productAlternative) => productAlternative.alternative
  )
  productAlternative: ProductAlternative[];
}
