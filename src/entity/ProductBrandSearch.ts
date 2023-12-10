import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Product } from "./Product";
import { Brand } from "./Brand";
import { BrandSearch } from "./BrandSearch";

@Entity({ name: "product_brand_search" })
@Index(["product", "brand_search"], { unique: true })
export class ProductBrandSearch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productBrandSearch)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => BrandSearch, (brandSearch) => brandSearch.productBrandSearch)
  @JoinColumn({ name: "brand_search_id" })
  brand_search: BrandSearch;
}
