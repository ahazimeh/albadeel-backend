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
exports.Alternative = void 0;
const typeorm_1 = require("typeorm");
const ProductAlternative_1 = require("./ProductAlternative");
const AlternativeSearch_1 = require("./AlternativeSearch");
let Alternative = class Alternative extends typeorm_1.BaseEntity {
};
exports.Alternative = Alternative;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Alternative.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Alternative.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.OneToMany)((type) => ProductAlternative_1.ProductAlternative, (productAlternative) => productAlternative.alternative),
    __metadata("design:type", Array)
], Alternative.prototype, "productAlternative", void 0);
__decorate([
    (0, typeorm_1.OneToMany)((type) => AlternativeSearch_1.AlternativeSearch, (alternativeSearch) => alternativeSearch.alternative),
    __metadata("design:type", Array)
], Alternative.prototype, "alternativeSearch", void 0);
exports.Alternative = Alternative = __decorate([
    (0, typeorm_1.Entity)()
], Alternative);
//# sourceMappingURL=Alternative.js.map