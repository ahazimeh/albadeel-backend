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
const path_1 = __importDefault(require("path"));
const BrandSearch_1 = require("./entity/BrandSearch");
const ProductBrandSearch_1 = require("./entity/ProductBrandSearch");
const companiesCsv_1 = require("./companiesCsv");
const AlternativeSearch_1 = require("./entity/AlternativeSearch");
const ProductAlternativeSearch_1 = require("./entity/ProductAlternativeSearch");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
var app = (0, express_1.default)();
var jsonParser = body_parser_1.default.json();
var urlencodedParser = body_parser_1.default.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(jsonParser);
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
let a;
data_source_1.AppDataSource.initialize()
    .then(() => {
    a = "success";
})
    .catch((error) => {
    a = error.message;
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
            let token = jsonwebtoken_1.default.sign({ id: user.id }, "sesfksdjfkdsfj");
            if (comparePass)
                return res.json({ success: true, token });
        }
        return res.json({ success: false });
    }
    catch (err) {
        return res.json({ success: false });
    }
});
app.post("/register", [
    (0, express_validator_1.body)("firstName").notEmpty(),
    (0, express_validator_1.body)("lastName").notEmpty(),
    (0, express_validator_1.body)("email").isEmail(),
    (0, express_validator_1.body)("city").notEmpty(),
    (0, express_validator_1.body)("country").notEmpty(),
    (0, express_validator_1.body)("password").notEmpty(),
], async (req, res) => {
    const result = (0, express_validator_1.validationResult)(req);
    if (result.errors.length) {
        return res.send({ result: result.errors });
    }
    let token = jsonwebtoken_1.default.sign({ foo: "bar" }, "shhhhh");
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
        try {
            await user.save();
        }
        catch (err) {
            return res.send({ err });
        }
        let token = jsonwebtoken_1.default.sign({ id: user.id }, "sesfksdjfkdsfj");
        return res.json({ success: true, token });
    }
    catch (err) {
        return res.json({ success: false, message: "an error has occured" });
    }
});
app.get("/insertForTesting", async (req, res) => {
    const alternativeP = await Alternative_1.Alternative.findOneBy({ id: 1 });
    if (!alternativeP)
        return;
    const alternativeSearch = new AlternativeSearch_1.AlternativeSearch();
    alternativeSearch.alternative = alternativeP;
    alternativeSearch.url = "beverage";
    await alternativeSearch.save();
});
app.post("/scrapKeywords", async (req, res) => {
    var _a, _b;
    const allAlternative = await Alternative_1.Alternative.find({
        where: { alternativeSearch: { completed: false } },
    });
    for (let j = 0; j < allAlternative.length; j++) {
        let alternativeId = allAlternative[j].id;
        const alternative = await Alternative_1.Alternative.findOneBy({ id: alternativeId });
        if (!alternative) {
            continue;
        }
        const alternativeSearch = await AlternativeSearch_1.AlternativeSearch.find({
            where: { alternative: { id: alternativeId }, completed: false },
        });
        for (let i = 0; i < alternativeSearch.length; i++) {
            const findCompleted = await AlternativeSearch_1.AlternativeSearch.findOneBy({
                completed: true,
                url: (_a = alternativeSearch[i]) === null || _a === void 0 ? void 0 : _a.url,
            });
            if (!findCompleted) {
                await (0, scrapWebsite_1.scrapeWebsite)(`https://www.barcodelookup.com/${(_b = alternativeSearch[i]) === null || _b === void 0 ? void 0 : _b.url}/1`, alternative.id, alternativeSearch[i].id);
            }
            else {
                console.log("hii", findCompleted.id);
                const productAlternativeSearch = await ProductAlternativeSearch_1.ProductAlternativeSearch.find({
                    where: {
                        alternative_search: { id: findCompleted.id },
                    },
                    relations: ["alternative_search", "product"],
                });
                for (let k = 0; k < productAlternativeSearch.length; k++) {
                    try {
                        let insertedProductAlternativeSearch = new ProductAlternativeSearch_1.ProductAlternativeSearch();
                        insertedProductAlternativeSearch.alternative_search =
                            alternativeSearch[i];
                        insertedProductAlternativeSearch.product =
                            productAlternativeSearch[k].product;
                        await insertedProductAlternativeSearch.save();
                    }
                    catch (err) { }
                    try {
                        let insertedProductAlternative = new ProductAlternative_1.ProductAlternative();
                        insertedProductAlternative.alternative = alternative;
                        insertedProductAlternative.product =
                            productAlternativeSearch[k].product;
                        await insertedProductAlternative.save();
                    }
                    catch (err) { }
                }
                alternativeSearch[i].completed = true;
                await alternativeSearch[i].save();
            }
        }
    }
    res.send({ success: true });
});
app.get("/insertProductAlternative", async (req, res) => {
    var _a, _b;
    console.log(req);
    try {
        const allBrands = await Brand_1.Brand.find({
            where: { brandSearch: { completed: false } },
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
                    try {
                        await (0, scrapWebsite_1.scrapeBrand)(`https://www.barcodelookup.com/${(_b = brandSearch[i]) === null || _b === void 0 ? void 0 : _b.searchText}/1`, brandId, brandSearch[i].id);
                    }
                    catch (err) {
                        return res.send({
                            err,
                            message: "an error has occured when calling scrapeBrand",
                        });
                    }
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
                            insertedProductBrandSearch.product =
                                productBrandSearch[k].product;
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
    }
    catch (err) {
        return res.send({ err });
    }
    return res.send("hii");
});
app.get("/getProduct/:barcode", async (req, res) => {
    try {
        const product = await Product_1.Product.findOneBy({ barcode: req.params.barcode });
        console.log(req.params);
        if (product) {
            return res.json({ success: true, product });
        }
        let productNotFound = new ProductNotFound_1.ProductNotFound();
        productNotFound.barcode = req.params.barcode;
        try {
            if (await productNotFound.save()) {
                const response = await axios_1.default.get(`https://api.barcodelookup.com/v3/products?key=jnleqjbhrnmmba2tiln6ujhrh5qgp7&barcode=${req.params.barcode}`, {
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
    }
    catch (err) {
        return res.send({ message: "an error has occured" });
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
    const reqBrand = req.query.brand;
    if (reqBrand) {
        const fetchBrand = await Brand_1.Brand.findOne({
            where: {
                name: reqBrand,
            },
        });
        if (fetchBrand) {
            return res.json({ success: true, alternativeId: fetchBrand.id });
        }
    }
    let arr = [];
    let ignoreText = ["a", "an", "and", "&", "of", "+", "/"];
    for (let i = 0; i < textArr.length; i++) {
        if (ignoreText.includes(textArr[i])) {
            continue;
        }
        const brand = Brand_1.Brand.findOne({
            where: {
                name: (0, typeorm_1.Like)(`%${textArr[i]}%`),
            },
        });
        arr.push(brand);
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
app.get("/getAlternativeBrand", async (req, res) => {
    const productBrand = await ProductBrand_1.ProductBrand.find({
        where: [
            {
                brand: {
                    id: req.query.id,
                },
            },
        ],
        skip: (req.query.page - 1) * 10,
        take: 10,
        relations: ["product"],
    });
    return res.send({ productBrand });
});
app.get("/getAlternative", async (req, res) => {
    const brandSearch = await BrandSearch_1.BrandSearch.find({
        where: {
            brand: {
                id: req.query.id,
            },
        },
    });
    if (!brandSearch.length) {
        return res.json({
            success: false,
            message: "could not find alternatives for this product",
        });
    }
    return res.send({ brandSearch });
    let searchTextArr = [];
    for (let i = 0; i < brandSearch.length; i++) {
        searchTextArr.push(brandSearch[i].id + "");
    }
    let productBrandSearch = await ProductBrandSearch_1.ProductBrandSearch.find({
        where: [
            {
                brand_search: {
                    id: (0, typeorm_1.In)(searchTextArr),
                },
            },
        ],
        skip: (req.query.page - 1) * 10,
        take: 10,
        relations: ["product"],
    });
    return res.send({ productBrandSearch });
});
app.get("/getAlternativeProducts", async (req, res) => {
    let productBrandSearch = await ProductBrandSearch_1.ProductBrandSearch.find({
        where: [
            {
                brand_search: {
                    id: (0, typeorm_1.In)(JSON.parse(req.query.id)),
                },
            },
        ],
        skip: (req.query.page - 1) * 10,
        take: 10,
        relations: ["product"],
    });
    return res.send({ productBrandSearch });
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
app.get("/getRequest", (req, res, next) => {
    return res.send({ success: true });
});
console.log("asdjaskl");
app.post("/delete-account", async (req, res, next) => {
    try {
        const user = await User_1.User.findOneBy({ email: req.body.email });
        const password = user === null || user === void 0 ? void 0 : user.password;
        const comparePass = await bcrypt_1.default.compare(req.body.password, password);
        if (comparePass) {
            User_1.User.delete(user.id);
            return res.redirect("/delete-account");
        }
        return res.redirect("/delete-account");
    }
    catch (err) {
        return res.redirect("/delete-account");
    }
});
app.get("/testPuppeteer", async (req, res, next) => {
    try {
        const browser = await puppeteer_extra_1.default.launch({
            ignoreDefaultArgs: ["--disable-extensions"],
        });
    }
    catch (err) {
        return res.send({ success: false, message: "an error has occured" });
    }
    return res.send({ success: true });
});
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.get("/privacy-policy", (req, res, next) => {
    console.log("ASdasd", path_1.default);
    console.log(path_1.default.join(__dirname, "public", "index.html"));
    res.sendFile(path_1.default.join(__dirname, "public", "index.html"));
});
app.get("/delete-account", (req, res, next) => {
    console.log("ASdasd", path_1.default);
    console.log(path_1.default.join(__dirname, "public", "form.html"));
    res.sendFile(path_1.default.join(__dirname, "public", "form.html"));
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});
app.listen(process.env.PORT || 4000, () => {
    console.log("server started on localhost:4000");
});
//# sourceMappingURL=index.js.map