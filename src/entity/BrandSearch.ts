import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ProductBrand } from "./ProductBrand";
import { Brand } from "./Brand";

@Entity()
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
}
