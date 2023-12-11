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
require("dotenv/config");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const data_source_1 = require("./data-source");
const cheerio = __importStar(require("cheerio"));
const axios_1 = __importDefault(require("axios"));
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const body_parser_1 = __importDefault(require("body-parser"));
const User_1 = require("./entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Product_1 = require("./entity/Product");
const Alternative_1 = require("./entity/Alternative");
const Brand_1 = require("./entity/Brand");
const scrapWebsite_1 = require("./utils/scrapWebsite");
const companies_1 = require("./companies");
const ProductAlternative_1 = require("./entity/ProductAlternative");
const typeorm_1 = require("typeorm");
const ProductNotFound_1 = require("./entity/ProductNotFound");
const ProductBrand_1 = require("./entity/ProductBrand");
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const BrandSearch_1 = require("./entity/BrandSearch");
const ProductBrandSearch_1 = require("./entity/ProductBrandSearch");
const companiesCsv_1 = require("./companiesCsv");
var app = (0, express_1.default)();
var jsonParser = body_parser_1.default.json();
var urlencodedParser = body_parser_1.default.urlencoded({ extended: false });
app.use(jsonParser);
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
let a;
data_source_1.AppDataSource.initialize()
    .then(() => {
    a = "success";
})
    .catch((error) => {
    a = "could not connect";
    console.log(error);
});
const url1 = "https://www.barcodelookup.com/7up/1";
async function getProducts() {
    try {
        const book_data = [];
        const response = await axios_1.default.get("https://www.barcodelookup.com/7up/1", {
            headers: {
                "User-Agent": "PostmanRuntime/7.29.4",
                Accept: "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
            },
        });
        const $ = cheerio.load(response.data);
        const products = $(".product-search-item-text");
        products.each(function () {
            let a = $(this).find("p").text();
        });
    }
    catch (error) {
        a = error.message;
        console.error("an error", error.message);
    }
}
app.get("/", (_, res) => {
    return res.send({ message: "success", a, env: process.env.NODE_ENV });
});
app.post("/login", async (req, res) => {
    try {
        const findUser = await User_1.User.findOneBy({ email: req.body.email });
        if (findUser) {
            const comparePass = await bcrypt_1.default.compare(req.body.password, findUser.password);
            if (comparePass)
                return res.json({ success: true, token: "asdasda" });
        }
        return res.json({ success: false });
    }
    catch (err) {
        return res.json({ success: false });
    }
});
app.post("/register", async (req, res) => {
    try {
        const findUser = await User_1.User.findOneBy({ email: req.body.email });
        if (findUser) {
            return res.json({ success: false, message: "email already exists" });
        }
        const user = new User_1.User();
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.email = req.body.email;
        user.password = await bcrypt_1.default.hash(req.body.password, 8);
        user.city = req.body.city;
        user.country = req.body.country;
        await user.save();
        return res.json({ success: true });
    }
    catch (err) {
        return res.json({ success: false, message: "an error has occured" });
    }
});
app.post("/insertProductAlternative", async (req, res) => {
    var _a, _b;
    console.log(req);
    const allBrands = await Brand_1.Brand.find({
        where: { brandSearch: { completed: false } },
        take: 10,
    });
    for (let j = 0; j < allBrands.length; j++) {
        let brandId = allBrands[j].id;
        const brand = await Brand_1.Brand.findOneBy({ id: brandId });
        if (!brand) {
            continue;
        }
        const brandSearch = await BrandSearch_1.BrandSearch.find({
            where: { brand: { id: brandId }, completed: false },
        });
        for (let i = 0; i < brandSearch.length; i++) {
            const findCompleted = await BrandSearch_1.BrandSearch.findOneBy({
                completed: true,
                searchText: (_a = brandSearch[i]) === null || _a === void 0 ? void 0 : _a.searchText,
            });
            console.log("zzzzzzz", findCompleted);
            if (!findCompleted) {
                await (0, scrapWebsite_1.scrapeBrand)(`https://www.barcodelookup.com/${(_b = brandSearch[i]) === null || _b === void 0 ? void 0 : _b.searchText}/1`, brandId, brandSearch[i].id);
            }
            else {
                console.log("hii", findCompleted.id);
                const productBrandSearch = await ProductBrandSearch_1.ProductBrandSearch.find({
                    where: {
                        brand_search: { id: findCompleted.id },
                    },
                    relations: ["brand_search", "product"],
                });
                for (let k = 0; k < productBrandSearch.length; k++) {
                    try {
                        let insertedProductBrandSearch = new ProductBrandSearch_1.ProductBrandSearch();
                        insertedProductBrandSearch.brand_search = brandSearch[i];
                        insertedProductBrandSearch.product = productBrandSearch[k].product;
                        await insertedProductBrandSearch.save();
                    }
                    catch (err) { }
                    try {
                        let insertedProductBrand = new ProductBrand_1.ProductBrand();
                        insertedProductBrand.brand = brand;
                        insertedProductBrand.product = productBrandSearch[k].product;
                        await insertedProductBrand.save();
                    }
                    catch (err) { }
                }
                brandSearch[i].completed = true;
                await brandSearch[i].save();
            }
        }
    }
    res.send("hii");
});
app.get("/getProduct/:barcode", async (req, res) => {
    const product = await Product_1.Product.findOneBy({ barcode: req.params.barcode });
    console.log(req.params);
    if (product) {
        return res.json({ success: true, product });
    }
    let productNotFound = new ProductNotFound_1.ProductNotFound();
    productNotFound.barcode = req.params.barcode;
    try {
        if (await productNotFound.save()) {
            const response = await axios_1.default.get(`https://api.barcodelookup.com/v3/products?key=8wyacernrjzq2p3i9kuh0nw5drwur6&barcode=${req.params.barcode}`, {
                headers: {
                    "User-Agent": "PostmanRuntime/7.29.4",
                    Accept: "*/*",
                    "Accept-Encoding": "gzip, deflate, br",
                    Connection: "keep-alive",
                },
            });
            let insertProduct = new Product_1.Product();
            insertProduct.barcode = req.params.barcode;
            insertProduct.category = response.data.products[0].category;
            insertProduct.manufacturer = response.data.products[0].manufacturer;
            insertProduct.brand = response.data.products[0].brand;
            insertProduct.imageUrl = response.data.products[0].images[0];
            insertProduct.name = response.data.products[0].title;
            insertProduct.save();
            return res.json({ success: true, product: insertProduct });
            console.log(response);
        }
        return;
    }
    catch (err) {
        return res.send({ success: false, message: "product not found" });
    }
});
console.log("sssssssssssssssss", process.env.NODE_ENV);
app.get("/insertIntoProductNotFound", async (req, res) => {
    let productNotFound = new ProductNotFound_1.ProductNotFound();
    productNotFound.barcode = "asdsadsad";
    try {
        if (await productNotFound.save()) {
            return res.json({ success: true });
        }
        return;
    }
    catch (err) {
        return res.json({ success: false });
    }
});
app.post("/storeBrands", async (req, res) => {
    for (let i = 0; i < companies_1.comapnies.length; i++) {
        const brand = new Brand_1.Brand();
        brand.name = companies_1.comapnies[i];
        brand.supports = true;
        await brand.save();
    }
    return res.json({ success: true });
});
app.get("/getAlternativeId", async (req, res) => {
    const textArr = req.query.text.split(" ");
    let arr = [];
    for (let i = 0; i < textArr.length; i++) {
        const alternative = Alternative_1.Alternative.findOneBy({ name: textArr[i] });
        arr.push(alternative);
    }
    let result = [];
    result = await Promise.all(arr);
    console.log("fff1", result);
    for (let i = 0; i < result.length; i++) {
        if (result[i]) {
            return res.json({ success: true, alternativeId: result[i].id });
        }
    }
    return res.json({
        success: false,
        message: "could not find alternatives for this product",
    });
});
app.get("/getAlternative", async (req, res) => {
    const productAlternative = await ProductAlternative_1.ProductAlternative.find({
        where: { alternative: { id: req.query.id } },
        skip: (req.query.page - 1) * 10,
        take: 10,
        relations: ["product"],
    });
    return res.json({ success: true, alternative: productAlternative });
});
app.get("/brand", async (req, res) => {
    const reqBrand = req.query.brand;
    if (!reqBrand) {
        return res.json({ success: true, brand: null });
    }
    console.log("asdsad", reqBrand);
    const brand = await Brand_1.Brand.findOneBy({ name: reqBrand });
    return res.json({ success: true, brand });
});
app.get("/brands", async (req, res) => {
    const reqBrand = req.query.text;
    if (!reqBrand) {
        return res.json({ success: true, brand: null });
    }
    const brands = await Brand_1.Brand.find({
        where: {
            name: (0, typeorm_1.ILike)(`%${reqBrand}%`),
        },
        take: 10,
    });
    return res.json({ success: true, brands });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});
app.get("/csv-parse", (req, res, next) => {
    let csvArr = [];
    fs_1.default.createReadStream("/home/ali/Desktop/albadeel/albadeel-backend/src/companies.csv")
        .pipe((0, csv_parser_1.default)({ separator: ";" }))
        .on("data", (data) => {
        console.log("gggg", Object.keys(data));
        let obj = {};
        for (let i = 0; i < Object.keys(data).length; i++) {
            let dataObj = Object.keys(data)[i];
            if (dataObj)
                console.log(data[dataObj]);
            if (dataObj)
                obj[dataObj] = data[dataObj];
        }
        csvArr.push(obj);
        return;
    })
        .on("end", () => {
        console.log(JSON.stringify(csvArr));
    });
    res.send("hiii");
});
app.get("/insertKeywords", async (req, res, next) => {
    for (let i = 0; i < companiesCsv_1.comapniesCsv.length; i++) {
        const brand = await Brand_1.Brand.findOneBy({ name: companiesCsv_1.comapniesCsv[i].Company });
        console.log(brand === null || brand === void 0 ? void 0 : brand.id);
        console.log(companiesCsv_1.comapniesCsv[i].Company);
        if (!brand)
            return;
        let keywords = companiesCsv_1.comapniesCsv[i].Keywords.split(", ");
        for (let i = 0; i < keywords.length; i++) {
            const brandSearch = new BrandSearch_1.BrandSearch();
            brandSearch.brand = brand;
            brandSearch.searchText = keywords[i];
            brandSearch.save();
        }
    }
});
app.listen(process.env.PORT || 4000, () => {
    console.log("server started on localhost:4000");
});
//# sourceMappingURL=index.js.map