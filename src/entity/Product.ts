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
import { ProductBrandSearch } from "./ProductBrandSearch";

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({})
  name: string;

  @Column({ unique: true })
  barcode: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  category: string;

  @Column()
  imageUrl: string;

  @OneToMany(
    (type) => ProductAlternative,
    (productAlternative) => productAlternative.product
  )
  productAlternative: ProductAlternative[];

  @OneToMany((type) => ProductBrand, (productBrand) => productBrand.product)
  productBrand: ProductBrand[];

  @OneToMany(
    (type) => ProductBrandSearch,
    (productBrandSearch) => productBrandSearch.product
  )
  productBrandSearch: ProductBrandSearch[];
}
