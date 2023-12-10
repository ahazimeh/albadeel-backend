"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./entity/User");
const Product_1 = require("./entity/Product");
const Brand_1 = require("./entity/Brand");
const Alternative_1 = require("./entity/Alternative");
const ProductAlternative_1 = require("./entity/ProductAlternative");
const ProductBrand_1 = require("./entity/ProductBrand");
const ProductNotFound_1 = require("./entity/ProductNotFound");
const BrandSearch_1 = require("./entity/BrandSearch");
const ProductBrandSearch_1 = require("./entity/ProductBrandSearch");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.NODE_ENV === "development1" ? "root" : "albadeel_root",
    password: process.env.NODE_ENV === "development1" ? "password" : "Venvt$Z4.Yi-",
    database: process.env.NODE_ENV === "development1"
        ? "check_if_support"
        : "albadeel_db",
    synchronize: true,
    logging: true,
    entities: [
        User_1.User,
        Product_1.Product,
        Brand_1.Brand,
        Alternative_1.Alternative,
        ProductAlternative_1.ProductAlternative,
        ProductBrand_1.ProductBrand,
        ProductNotFound_1.ProductNotFound,
        BrandSearch_1.BrandSearch,
        ProductBrandSearch_1.ProductBrandSearch,
    ],
    subscribers: [],
    migrations: [],
});
//# sourceMappingURL=data-source.js.map