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
exports.AlternativeSearch = void 0;
const typeorm_1 = require("typeorm");
const Alternative_1 = require("./Alternative");
const ProductAlternativeSearch_1 = require("./ProductAlternativeSearch");
let AlternativeSearch = class AlternativeSearch extends typeorm_1.BaseEntity {
};
exports.AlternativeSearch = AlternativeSearch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AlternativeSearch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AlternativeSearch.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Alternative_1.Alternative, (alternative) => alternative.id),
    (0, typeorm_1.JoinColumn)({ name: "alternative_search_id" }),
    __metadata("design:type", Alternative_1.Alternative)
], AlternativeSearch.prototype, "alternative", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], AlternativeSearch.prototype, "completed", void 0);
__decorate([
    (0, typeorm_1.OneToMany)((type) => ProductAlternativeSearch_1.ProductAlternativeSearch, (productAlternativeSearch) => productAlternativeSearch.alternative_search),
    __metadata("design:type", Array)
], AlternativeSearch.prototype, "productAlternativeSearch", void 0);
exports.AlternativeSearch = AlternativeSearch = __decorate([
    (0, typeorm_1.Entity)()
], AlternativeSearch);
//# sourceMappingURL=AlternativeSearch.js.map