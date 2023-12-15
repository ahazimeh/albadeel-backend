import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { ProductBrand } from "./ProductBrand";
import { Brand } from "./Brand";
import { ProductBrandSearch } from "./ProductBrandSearch";

@Entity()
@Index(["brand", "searchText"], { unique: true })
export class BrandSearch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  searchText: string;

  @ManyToOne(() => Brand, (brand) => brand.id)
  @JoinColumn({ name: "brand_id" })
  brand: Brand;

  @Column({ default: false })
  completed: boolean;

  @OneToMany(
    (type) => ProductBrandSearch,
    (productBrandSearch) => productBrandSearch.brand_search
  )
  productBrandSearch: ProductBrandSearch[];
}
