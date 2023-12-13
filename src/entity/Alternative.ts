import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToMany,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Product } from "./Product";
import { ProductAlternative } from "./ProductAlternative";
import { AlternativeSearch } from "./AlternativeSearch";

@Entity()
export class Alternative extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(
    (type) => ProductAlternative,
    (productAlternative) => productAlternative.alternative
  )
  productAlternative: ProductAlternative[];

  @OneToMany(
    (type) => AlternativeSearch,
    (alternativeSearch) => alternativeSearch.alternative
  )
  alternativeSearch: AlternativeSearch[];
}
