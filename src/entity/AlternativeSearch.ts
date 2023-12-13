import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { Alternative } from "./Alternative";
import { ProductAlternativeSearch } from "./ProductAlternativeSearch";

@Entity()
export class AlternativeSearch extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  url: string;

  @ManyToOne(() => Alternative, (alternative) => alternative.id)
  @JoinColumn({ name: "alternative_search_id" })
  alternative: Alternative;

  @Column({ default: false })
  completed: boolean;

  @OneToMany(
    (type) => ProductAlternativeSearch,
    (productAlternativeSearch) => productAlternativeSearch.alternative_search
  )
  productAlternativeSearch: ProductAlternativeSearch[];
}
