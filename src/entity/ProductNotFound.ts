import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Alternative } from "./Alternative";
import { Brand } from "./Brand";
import { ProductAlternative } from "./ProductAlternative";
import { ProductBrand } from "./ProductBrand";

@Entity()
export class ProductNotFound extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  barcode: string;
}
