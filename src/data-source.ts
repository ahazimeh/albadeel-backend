import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Product } from "./entity/Product";
import { Brand } from "./entity/Brand";
import { Alternative } from "./entity/Alternative";
import { ProductAlternative } from "./entity/ProductAlternative";
import { ProductBrand } from "./entity/ProductBrand";
import { ProductNotFound } from "./entity/ProductNotFound";
import { BrandSearch } from "./entity/BrandSearch";
import { ProductBrandSearch } from "./entity/ProductBrandSearch";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: process.env.NODE_ENV === "development1" ? "root" : "albadeel_root",
  password:
    process.env.NODE_ENV === "development1" ? "password" : "Venvt$Z4.Yi-",
  database:
    process.env.NODE_ENV === "development1"
      ? "check_if_support"
      : "albadeel_db",
  synchronize: true,
  logging: true,
  entities: [
    User,
    Product,
    Brand,
    Alternative,
    ProductAlternative,
    ProductBrand,
    ProductNotFound,
    BrandSearch,
    ProductBrandSearch,
  ],
  subscribers: [],
  migrations: [],
});
