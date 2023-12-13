import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Product } from "./Product";
import { AlternativeSearch } from "./AlternativeSearch";

@Entity({ name: "product_alternative_search" })
@Index(["product", "alternative_search"], { unique: true })
export class ProductAlternativeSearch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productAlternativeSearch)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(
    () => AlternativeSearch,
    (alternativeSearch) => alternativeSearch.productAlternativeSearch
  )
  @JoinColumn({ name: "alternative_search_id" })
  alternative_search: AlternativeSearch;
}
