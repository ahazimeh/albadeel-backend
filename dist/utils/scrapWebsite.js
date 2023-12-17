"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeBrand = exports.scrapeWebsite = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const Alternative_1 = require("../entity/Alternative");
const cheerio = __importStar(require("cheerio"));
const Product_1 = require("../entity/Product");
const ProductAlternative_1 = require("../entity/ProductAlternative");
const ProductBrand_1 = require("../entity/ProductBrand");
const Brand_1 = require("../entity/Brand");
const BrandSearch_1 = require("../entity/BrandSearch");
const ProductBrandSearch_1 = require("../entity/ProductBrandSearch");
const ProductAlternativeSearch_1 = require("../entity/ProductAlternativeSearch");
const AlternativeSearch_1 = require("../entity/AlternativeSearch");
function incrementLastNumberInUrl(url) {
    let match = url.match(/\/(\d+)(?:\/)?$/);
    if (match && match[1]) {
        let incrementedNumber = parseInt(match[1]) + 1;
        let newUrl = url.replace(/\/\d+(?:\/)?$/, "/" + incrementedNumber);
        if (incrementedNumber >= 10) {
            return -1;
        }
        return newUrl;
    }
    else {
        return url;
    }
}
function escapeSelector(text) {
    return text.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
}
async function insertIntoProductAlternative(productId, alternativeId, alternativeSearchId) {
    const product = await Product_1.Product.findOneBy({ id: productId });
    const alternative = await Alternative_1.Alternative.findOneBy({ id: alternativeId });
    const alternativeSearch = await AlternativeSearch_1.AlternativeSearch.findOneBy({
        id: alternativeSearchId,
    });
    const productAlternative = new ProductAlternative_1.ProductAlternative();
    if (alternative)
        productAlternative.alternative = alternative;
    if (product)
        productAlternative.product = product;
    if (product && alternative) {
        const existingProductAlternative = await ProductAlternative_1.ProductAlternative.findOne({
            where: {
                alternative: { id: alternativeId },
                product: { id: productId },
            },
        });
        if (!existingProductAlternative)
            await productAlternative.save();
    }
    const productAlternativeSearch = new ProductAlternativeSearch_1.ProductAlternativeSearch();
    if (alternativeSearch)
        productAlternativeSearch.alternative_search = alternativeSearch;
    if (product)
        productAlternativeSearch.product = product;
    if (product && alternativeSearch) {
        const existingProductAlternativeSearch = await ProductAlternativeSearch_1.ProductAlternativeSearch.findOne({
            where: {
                alternative_search: { id: alternativeSearchId },
                product: { id: productId },
            },
        });
        if (!existingProductAlternativeSearch)
            await productAlternativeSearch.save();
    }
}
const scrapeWebsite = async (url, id, alternativeSearchId) => {
    const lastUrlCount = url.split("/")[url.split("/").length - 1];
    let alternativeId = id;
    const browser = await puppeteer_extra_1.default.launch({
        ignoreDefaultArgs: ["--disable-extensions"],
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url);
    const htmlContent = await page.content();
    const $ = cheerio.load(htmlContent);
    const allProducts = $("#product-search-results li");
    console.log("ggggggggg", allProducts);
    const products = $(".product-search-item-text");
    allProducts.each(function () {
        console.log("hiiiii");
        const product = new Product_1.Product();
        let a = $(this).find("p").text();
        let pTagCount = $(this).find("p").length;
        for (let i = 0; i < pTagCount; i++) {
            const text = $(this).find(`p:eq(${i})`).text();
            if (text.startsWith("Barcode: ")) {
                product.barcode = text.split("Barcode: ")[1];
            }
            else {
                if (text.startsWith("Category: ")) {
                    product.category = text.split("Category: ")[1];
                }
                else {
                    if (text.startsWith("Manufacturer: ")) {
                        product.manufacturer = text.split("Manufacturer: ")[1];
                    }
                    else {
                        if (text.startsWith("Brand: ")) {
                            product.brand = text.split("Brand: ")[1];
                        }
                        else {
                            const imgTags = $(this).find("img");
                            product.imageUrl = "no-image";
                            imgTags.each(function () {
                                const src = $(this).attr("src");
                                product.imageUrl = src || "";
                            });
                            product.name = text;
                        }
                    }
                }
            }
        }
        console.log("-------------------");
        Product_1.Product.findOneBy({ barcode: product.barcode })
            .then((res) => {
            if (res) {
                console.log("asdasdsad", res.id);
                insertIntoProductAlternative(res.id, alternativeId, alternativeSearchId);
            }
            else {
                product
                    .save()
                    .then((res) => {
                    console.log("bbbbbbbbbbb", res);
                    insertIntoProductAlternative(res.id, alternativeId, alternativeSearchId);
                })
                    .catch((err) => { });
            }
        })
            .catch((err) => { });
        console.log(product);
        try {
        }
        catch (err) { }
    });
    const linkExists = $(`a[href="${incrementLastNumberInUrl(url)}"]`).length > 0;
    console.log("asdas", linkExists);
    let newUrl = incrementLastNumberInUrl(url);
    if (linkExists) {
        if (newUrl === -1) {
            await AlternativeSearch_1.AlternativeSearch.save({
                id: alternativeSearchId,
                completed: true,
            });
        }
        else {
            await (0, exports.scrapeWebsite)(newUrl + "", id, alternativeSearchId);
        }
    }
    else {
        await AlternativeSearch_1.AlternativeSearch.save({
            id: alternativeSearchId,
            completed: true,
        });
    }
    await browser.close();
};
exports.scrapeWebsite = scrapeWebsite;
async function insertIntoProductBrand(productId, brandId, brandSearchId) {
    const product = await Product_1.Product.findOneBy({ id: productId });
    const brand = await Brand_1.Brand.findOneBy({ id: brandId });
    const brandSearch = await BrandSearch_1.BrandSearch.findOneBy({ id: brandSearchId });
    const productBrand = new ProductBrand_1.ProductBrand();
    if (brand)
        productBrand.brand = brand;
    if (product)
        productBrand.product = product;
    if (product && brand) {
        const existingProductBrand = await ProductBrand_1.ProductBrand.findOneBy({
            brand: { id: brandId },
            product: { id: productId },
        });
        if (!existingProductBrand)
            await productBrand.save();
    }
    const productBrandSearch = new ProductBrandSearch_1.ProductBrandSearch();
    if (brandSearch)
        productBrandSearch.brand_search = brandSearch;
    if (product)
        productBrandSearch.product = product;
    if (product && brandSearch) {
        const existingProductBrandSearch = await ProductBrandSearch_1.ProductBrandSearch.findOne({
            where: {
                brand_search: { id: brandSearchId },
                product: { id: productId },
            },
        });
        if (!existingProductBrandSearch)
            await productBrandSearch.save();
    }
}
const scrapeBrand = async (url, brandId, brandSearchId) => {
    const browser = await puppeteer_extra_1.default.launch({
        ignoreDefaultArgs: ["--disable-extensions"],
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);
    await page.goto(url);
    const htmlContent = await page.content();
    const $ = cheerio.load(htmlContent);
    const allProducts = $("#product-search-results li");
    console.log("ggggggggg", allProducts);
    const products = $(".product-search-item-text");
    allProducts.each(function () {
        console.log("hiiiii");
        const product = new Product_1.Product();
        let a = $(this).find("p").text();
        let pTagCount = $(this).find("p").length;
        for (let i = 0; i < pTagCount; i++) {
            const text = $(this).find(`p:eq(${i})`).text();
            if (text.startsWith("Barcode: ")) {
                product.barcode = text.split("Barcode: ")[1];
            }
            else {
                if (text.startsWith("Category: ")) {
                    product.category = text.split("Category: ")[1];
                }
                else {
                    if (text.startsWith("Manufacturer: ")) {
                        product.manufacturer = text.split("Manufacturer: ")[1];
                    }
                    else {
                        if (text.startsWith("Brand: ")) {
                            product.brand = text.split("Brand: ")[1];
                        }
                        else {
                            const imgTags = $(this).find("img");
                            product.imageUrl = "no-image";
                            imgTags.each(function () {
                                const src = $(this).attr("src");
                                product.imageUrl = src || "";
                            });
                            product.name = text;
                        }
                    }
                }
            }
        }
        console.log("-------------------");
        Product_1.Product.findOneBy({ barcode: product.barcode })
            .then((res) => {
            if (res) {
                console.log("asdasdsad", res.id);
                insertIntoProductBrand(res.id, brandId, brandSearchId);
            }
            else {
                product
                    .save()
                    .then((res) => {
                    console.log("bbbbbbbbbbb", res);
                    insertIntoProductBrand(res.id, brandId, brandSearchId);
                })
                    .catch((err) => { });
            }
        })
            .catch((err) => { });
        console.log(product);
        try {
        }
        catch (err) { }
    });
    const linkExists = $(`a[href="${incrementLastNumberInUrl(url)}"]`).length > 0;
    console.log("asdas", linkExists);
    let newUrl = incrementLastNumberInUrl(url);
    if (linkExists) {
        if (newUrl === -1) {
            await BrandSearch_1.BrandSearch.save({
                id: brandSearchId,
                completed: true,
                partial: true,
            });
        }
        else {
            await (0, exports.scrapeBrand)(newUrl + "", brandId, brandSearchId);
        }
    }
    else {
        await BrandSearch_1.BrandSearch.save({
            id: brandSearchId,
            completed: true,
            partial: true,
        });
    }
    await browser.close();
};
exports.scrapeBrand = scrapeBrand;
//# sourceMappingURL=scrapWebsite.js.map