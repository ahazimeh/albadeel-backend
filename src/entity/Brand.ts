import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { ProductBrand } from "./ProductBrand";

@Entity()
export class Brand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  searchText: string;

  @Column()
  supports: boolean;

  @Column({ default: false })
  completed: boolean;

  @OneToMany((type) => ProductBrand, (productBrand) => productBrand.brand)
  productBrand: ProductBrand[];
}
