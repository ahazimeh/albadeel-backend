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
exports.ProductAlternative = void 0;
const typeorm_1 = require("typeorm");
const Product_1 = require("./Product");
const Alternative_1 = require("./Alternative");
let ProductAlternative = class ProductAlternative extends typeorm_1.BaseEntity {
};
exports.ProductAlternative = ProductAlternative;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProductAlternative.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Product_1.Product, (product) => product.productAlternative),
    (0, typeorm_1.JoinColumn)({ name: "product_id" }),
    __metadata("design:type", Product_1.Product)
], ProductAlternative.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alternative_1.Alternative, (alternative) => alternative.productAlternative),
    (0, typeorm_1.JoinColumn)({ name: "alternative_id" }),
    __metadata("design:type", Alternative_1.Alternative)
], ProductAlternative.prototype, "alternative", void 0);
exports.ProductAlternative = ProductAlternative = __decorate([
    (0, typeorm_1.Entity)({ name: "product_alternative" })
], ProductAlternative);
//# sourceMappingURL=ProductAlternative.js.map