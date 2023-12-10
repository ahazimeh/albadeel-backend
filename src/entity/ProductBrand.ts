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

@Entity({ name: "product_brand" })
@Index(["product", "brand"], { unique: true })
export class ProductBrand extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.productBrand)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => Brand, (brand) => brand.productBrand)
  @JoinColumn({ name: "brand_id" })
  brand: Brand;
}
