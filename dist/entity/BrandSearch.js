"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandSearch = void 0;
const typeorm_1 = require("typeorm");
const Brand_1 = require("./Brand");
const ProductBrandSearch_1 = require("./ProductBrandSearch");
let BrandSearch = class BrandSearch extends typeorm_1.BaseEntity {
};
exports.BrandSearch = BrandSearch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BrandSearch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], BrandSearch.prototype, "searchText", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: false }),
    __metadata("design:type", Boolean)
], BrandSearch.prototype, "partial", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Brand_1.Brand, (brand) => brand.id),
    (0, typeorm_1.JoinColumn)({ name: "brand_id" }),
    __metadata("design:type", Brand_1.Brand)
], BrandSearch.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], BrandSearch.prototype, "completed", void 0);
__decorate([
    (0, typeorm_1.OneToMany)((type) => ProductBrandSearch_1.ProductBrandSearch, (productBrandSearch) => productBrandSearch.brand_search),
    __metadata("design:type", Array)
], BrandSearch.prototype, "productBrandSearch", void 0);
exports.BrandSearch = BrandSearch = __decorate([
    (0, typeorm_1.Entity)(),
    (0, typeorm_1.Index)(["brand", "searchText"], { unique: true })
], BrandSearch);
//# sourceMappingURL=BrandSearch.js.map