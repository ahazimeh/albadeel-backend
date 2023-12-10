import {
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "./Product";
import { Alternative } from "./Alternative";

@Entity({ name: "product_alternative" })
export class ProductAlternative extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productAlternative)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => Alternative, (alternative) => alternative.productAlternative)
  @JoinColumn({ name: "alternative_id" })
  alternative: Alternative;
}
