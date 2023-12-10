import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { ProductBrand } from "./ProductBrand";
import { BrandSearch } from "./BrandSearch";

@Entity()
export class Brand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  searchText: string;

  @Column()
  supports: boolean;

  @Column({ default: false })
  completed: boolean;

  @OneToMany((type) => ProductBrand, (productBrand) => productBrand.brand)
  productBrand: ProductBrand[];
  @OneToMany((type) => BrandSearch, (brandSearch) => brandSearch.brand)
  brandSearch: BrandSearch[];
}
