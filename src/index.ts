// @ts-nocheck
import "dotenv/config";
import "reflect-metadata";
import express from "express";
import requireLogin from "./middlewares/requireLogin";
import { AppDataSource } from "./data-source";
import { sendEmail } from "./utils/sendMail";
import * as cheerio from "cheerio";
import axios from "axios";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import bodyParser from "body-parser";
import { User } from "./entity/User";
import bcrypt from "bcrypt";
import { Product } from "./entity/Product";
import { Alternative } from "./entity/Alternative";
import { Brand } from "./entity/Brand";
import { scrapeBrand, scrapeWebsite } from "./utils/scrapWebsite";
import { comapnies } from "./companies";
import { ProductAlternative } from "./entity/ProductAlternative";
import { ILike, In, IsNull, Like, Not } from "typeorm";
import { ProductNotFound } from "./entity/ProductNotFound";
import { ProductBrand } from "./entity/ProductBrand";
import parser from "csv-parser";
import fs from "fs";
import path from "path";
import { BrandSearch } from "./entity/BrandSearch";
import { ProductBrandSearch } from "./entity/ProductBrandSearch";
import { comapniesCsv } from "./companiesCsv";
import { AlternativeSearch } from "./entity/AlternativeSearch";
import { ProductAlternativeSearch } from "./entity/ProductAlternativeSearch";
import Jwt from "jsonwebtoken";
import { body, query, validationResult } from "express-validator";
import path from "path";

var app = express();

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use(jsonParser);

puppeteer.use(StealthPlugin());

// app.use("/", requireLogin);
let a: string;
AppDataSource.initialize()
  .then(() => {
    a = "success";
    // here you can start to work with your database
  })
  .catch((error) => {
    a = error.message;
    console.log(error);
  });

const url1 = "https://www.barcodelookup.com/7up/1";
async function getProducts() {
  try {
    const book_data: any = [];
    const response = await axios.get("https://www.barcodelookup.com/7up/1", {
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
  } catch (error) {
    a = error.message;
    console.error("an error", error.message);
  }
}

app.get(
  "/",
  // requireLogin ,
  (_, res) => {
    return res.send({ message: "success", a, env: process.env.NODE_ENV });
    // console.log("aazzzz");
    // console.log("aa1a", process.env.ACCESS_TOKEN_SECRET);
    // sendEmail(
    //   "hazimeh95@gmail.com",
    //   `<a href="http://localhost:3000/change-password/token">reset password</a>`
    // );
    // getGenre().then(() => {
    //   res.send("aa31");
    // });
    // getProducts().then(() => {
    //   res.send("aa31");
    // });
  }
);
app.post("/login", async (req, res) => {
  try {
    const findUser = await User.findOneBy({ email: req.body.email });
    if (findUser) {
      const comparePass = await bcrypt.compare(
        req.body.password,
        findUser.password
      );
      let token = Jwt.sign({ id: findUser.id }, "sesfksdjfkdsfj");
      if (comparePass) return res.json({ success: true, token });
    }
    return res.json({ success: false });
  } catch (err) {
    return res.json({ success: false });
  }
});
app.post(
  "/register",
  [
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
    body("email").isEmail(),
    body("city").notEmpty(),
    body("country").notEmpty(),
    body("password").notEmpty(),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (result.errors.length) {
      return res.send({ result: result.errors });
    }
    let token = Jwt.sign({ foo: "bar" }, "shhhhh");
    // var decoded = Jwt.verify(token, "shhhhh1");
    // return res.send({ token });
    try {
      return res.send({ step: 1 });
      const findUser = await User.findOneBy({ email: req.body.email });
      if (findUser) {
        return res.json({ success: false, message: "email already exists" });
      }
      const user = new User();
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;
      user.password = await bcrypt.hash(req.body.password, 8);
      user.city = req.body.city;
      user.country = req.body.country;
      try {
        await user.save();
      } catch (err) {
        return res.send({ err });
      }
      let token = Jwt.sign({ id: user.id }, "sesfksdjfkdsfj");
      return res.json({ success: true, token });
    } catch (err) {
      return res.json({ success: false, message: "an error has occured" });
    }
  }
);
app.get("/insertForTesting", async (req, res) => {
  // const alternative = new Alternative();
  // alternative.name = "7up";
  // try {
  //   await alternative.save();
  // } catch (err) {}
  const alternativeP = await Alternative.findOneBy({ id: 1 });
  if (!alternativeP) return;
  const alternativeSearch = new AlternativeSearch();
  alternativeSearch.alternative = alternativeP;
  alternativeSearch.url = "beverage";
  await alternativeSearch.save();
});
app.post("/scrapKeywords", async (req, res) => {
  const allAlternative = await Alternative.find({
    where: { alternativeSearch: { completed: false } },
  });
  for (let j = 0; j < allAlternative.length; j++) {
    let alternativeId = allAlternative[j].id;
    const alternative = await Alternative.findOneBy({ id: alternativeId });
    if (!alternative) {
      continue;
    }
    const alternativeSearch = await AlternativeSearch.find({
      where: { alternative: { id: alternativeId }, completed: false },
    });

    for (let i = 0; i < alternativeSearch.length; i++) {
      const findCompleted = await AlternativeSearch.findOneBy({
        completed: true,
        url: alternativeSearch[i]?.url,
      });
      if (!findCompleted) {
        await scrapeWebsite(
          `https://www.barcodelookup.com/${alternativeSearch[i]?.url}/1`,
          alternative.id,
          alternativeSearch[i].id
          // "7up"
        );
      } else {
        console.log("hii", findCompleted.id);
        const productAlternativeSearch = await ProductAlternativeSearch.find({
          where: {
            alternative_search: { id: findCompleted.id },
          },
          relations: ["alternative_search", "product"],
          // relations: ["product", "brand"],
        });
        // return res.send({ productBrandSearch });
        for (let k = 0; k < productAlternativeSearch.length; k++) {
          // productBrand[k].product.id
          try {
            let insertedProductAlternativeSearch =
              new ProductAlternativeSearch();
            insertedProductAlternativeSearch.alternative_search =
              alternativeSearch[i];
            insertedProductAlternativeSearch.product =
              productAlternativeSearch[k].product;
            await insertedProductAlternativeSearch.save();
          } catch (err) {}
          try {
            let insertedProductAlternative = new ProductAlternative();
            insertedProductAlternative.alternative = alternative;
            insertedProductAlternative.product =
              productAlternativeSearch[k].product;
            await insertedProductAlternative.save();
          } catch (err) {}
        }
        alternativeSearch[i].completed = true;
        await alternativeSearch[i].save();
        // brand.completed = true;
        // await brand.save();
        // return res.send({ productBrand });
      }
    }
    // return res.send({ alternativeSearch });
  }
  // await scrapeWebsite("https://www.barcodelookup.com/beverage/1", "7up");
  res.send({ success: true });
});
app.get("/insertProductAlternative", async (req, res) => {
  console.log(req);
  try {
    const allBrands = await Brand.find({
      where: { brandSearch: { completed: false } },
      // take: 10,
    });
    // return res.send({ allBrands });
    for (let j = 0; j < allBrands.length; j++) {
      // return res.send({ allBrands });
      let brandId = allBrands[j].id;
      const brand = await Brand.findOneBy({ id: brandId });
      if (!brand) {
        continue;
      }
      const brandSearch = await BrandSearch.find({
        where: { brand: { id: brandId }, completed: false },
      });
      // return res.send({ brandSearch });
      // for(let i =0;i<brandSearch.length;i++) {
      //   if(brandSearch.)
      // }
      // if (brand?.completed) {
      //   continue;
      //   // return res.send({ success: false, brand: brand });
      // }
      // if (!findCompleted)
      for (let i = 0; i < brandSearch.length; i++) {
        const findCompleted = await BrandSearch.findOneBy({
          completed: true,
          searchText: brandSearch[i]?.searchText,
        });
        console.log("zzzzzzz", findCompleted);
        if (!findCompleted) {
          try {
            await scrapeBrand(
              `https://www.barcodelookup.com/${brandSearch[i]?.searchText}/1`,
              brandId,
              brandSearch[i].id
              // "7up"
            );
          } catch (err) {
            return res.send({
              err,
              message: "an error has occured when calling scrapeBrand",
            });
          }
        } else {
          console.log("hii", findCompleted.id);
          const productBrandSearch = await ProductBrandSearch.find({
            where: {
              brand_search: { id: findCompleted.id },
            },
            relations: ["brand_search", "product"],
            // relations: ["product", "brand"],
          });
          // return res.send({ productBrandSearch });
          for (let k = 0; k < productBrandSearch.length; k++) {
            // productBrand[k].product.id
            try {
              let insertedProductBrandSearch = new ProductBrandSearch();
              insertedProductBrandSearch.brand_search = brandSearch[i];
              insertedProductBrandSearch.product =
                productBrandSearch[k].product;
              await insertedProductBrandSearch.save();
            } catch (err) {}

            try {
              let insertedProductBrand = new ProductBrand();
              insertedProductBrand.brand = brand;
              insertedProductBrand.product = productBrandSearch[k].product;
              await insertedProductBrand.save();
            } catch (err) {}
          }
          brandSearch[i].completed = true;
          await brandSearch[i].save();
          // brand.completed = true;
          // await brand.save();
          // return res.send({ productBrand });
        }
      }
      // else {
      //   console.log("hii", findCompleted.id);
      //   const productBrand = await ProductBrand.find({
      //     where: {
      //       brand: { id: findCompleted.id },
      //     },
      //     relations: ["brand", "product"],
      //     // relations: ["product", "brand"],
      //   });
      //   for (let i = 0; i < productBrand.length; i++) {
      //     // productBrand[i].product.id
      //     let insertedProductBrand = new ProductBrand();
      //     insertedProductBrand.brand = brand;
      //     insertedProductBrand.product = productBrand[i].product;
      //     await insertedProductBrand.save();
      //   }
      //   brand.completed = true;
      //   await brand.save();
      //   // return res.send({ productBrand });
      // }
    }
    // scrapeWebsite(
    //   "https://www.barcodelookup.com/Cold-Sore-Treatment/1",
    //   "7up"
    //   // "7up"
    // );
    // scrapeWebsite(
    //   "https://www.barcodelookup.com/beverage/1",
    //   "7up"
    //   // "7up"
    // );
  } catch (err) {
    return res.send({ err });
  }
  return res.send("hii");
});

app.get("/getProduct/:barcode", async (req, res) => {
  try {
    const product = await Product.findOneBy({ barcode: req.params.barcode });
    console.log(req.params);
    if (product) {
      return res.json({ success: true, product });
    }
    let productNotFound = new ProductNotFound();
    productNotFound.barcode = req.params.barcode;
    try {
      if (await productNotFound.save()) {
        // try to find this product online;
        const response = await axios.get(
          `https://api.barcodelookup.com/v3/products?key=jnleqjbhrnmmba2tiln6ujhrh5qgp7&barcode=${req.params.barcode}`,
          {
            headers: {
              "User-Agent": "PostmanRuntime/7.29.4",
              Accept: "*/*",
              "Accept-Encoding": "gzip, deflate, br",
              Connection: "keep-alive",
            },
          }
        );
        let insertProduct = new Product();
        insertProduct.barcode = req.params.barcode;
        insertProduct.category = response.data.products[0].category;
        insertProduct.manufacturer = response.data.products[0].manufacturer;
        insertProduct.brand = response.data.products[0].brand;
        insertProduct.imageUrl = response.data.products[0].images[0];
        insertProduct.name = response.data.products[0].title;
        insertProduct.save();
        return res.json({ success: true, product: insertProduct });

        console.log(response);

        // if found the save it and send it back to the user
        // if not then also return an error // done because api return error
      }
      return;
    } catch (err) {
      return res.send({ success: false, message: "product not found" });
    }
    // const response = await axios.get(`https://api.barcodelookup.com/v3/products?key=8wyacernrjzq2p3i9kuh0nw5drwur6&barcode=${req.params.barcode}`, {
    //   headers: {
    //     "User-Agent": "PostmanRuntime/7.29.4",
    //     Accept: "*/*",
    //     "Accept-Encoding": "gzip, deflate, br",
    //     Connection: "keep-alive",
    //   },
    // });
  } catch (err) {
    return res.send({ message: "an error has occured" });
  }
});
console.log("sssssssssssssssss", process.env.NODE_ENV);
app.get("/insertIntoProductNotFound", async (req, res) => {
  let productNotFound = new ProductNotFound();
  productNotFound.barcode = "asdsadsad";
  try {
    if (await productNotFound.save()) {
      return res.json({ success: true });
    }
    return;
  } catch (err) {
    return res.json({ success: false });
  }
});

app.post("/storeBrands", async (req, res) => {
  for (let i = 0; i < comapnies.length; i++) {
    const brand = new Brand();
    brand.name = comapnies[i];
    brand.supports = true;
    await brand.save();
  }
  return res.json({ success: true });
});

app.get("/getAlternativeId", async (req, res) => {
  try {
    // console.log(req.query.text.split(" "));
    // @ts-ignore
    const textArr = req.query.text.split(" ");
    const reqBrand = req.query.brand;
    if (reqBrand) {
      const fetchBrand = await Brand.findOne({
        where: {
          name: reqBrand,
        },
      });
      if (fetchBrand) {
        return res.json({ success: true, alternativeId: fetchBrand.id });
      }
    }
    // Promise.all(textArr)
    let arr = [];
    let ignoreText = ["a", "an", "and", "&", "of", "+", "/"];
    for (let i = 0; i < textArr.length; i++) {
      if (ignoreText.includes(textArr[i])) {
        continue;
      }
      const brand = Brand.findOne({
        // name: textArr[i]
        where: {
          name: Like(`%${textArr[i]}%`),
        },
      });
      arr.push(brand);
    }
    let result: any = [];
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
  } catch (err) {
    return res.json({ success: false });
  }
});

app.get("/getAlternativeBrand", async (req, res) => {
  try {
    const productBrand = await ProductBrand.find({
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
  } catch (err) {
    return res.json({ success: false });
  }
});

app.get("/getAlternative", async (req, res) => {
  try {
    const brandSearch = await BrandSearch.find({
      // @ts-ignore
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
    // now I will try to get alternatives// to be done in another api
    return res.send({ brandSearch });
    let searchTextArr: string[] = [];
    for (let i = 0; i < brandSearch.length; i++) {
      searchTextArr.push(brandSearch[i].id + "");
    }
    // return res.send({ searchTextArr });
    let productBrandSearch = await ProductBrandSearch.find({
      where: [
        {
          brand_search: {
            id: In(searchTextArr),
          },
        },
      ],
      skip: (req.query.page - 1) * 10,
      take: 10,
      relations: ["product"],
    });
    return res.send({ productBrandSearch });
    // const productAlternative = await ProductAlternative.find({
    //   // @ts-ignore
    //   where: { alternative: { id: req.query.id } },
    //   // @ts-ignore
    //   skip: (req.query.page - 1) * 10,
    //   take: 10,
    //   relations: ["product"],
    // });
    // return res.json({ success: true, alternative: productAlternative });
  } catch (err) {
    return res.json({ success: false });
  }
});
app.get("/getAlternativeProducts", async (req, res) => {
  try {
    // return res.send({ id: JSON.parse(req.query.id) });

    // for (let i = 0; i < brandSearch.length; i++) {
    //   searchTextArr.push(brandSearch[i].id + "");
    // }
    // // return res.send({ searchTextArr });
    let productBrandSearch = await ProductBrandSearch.find({
      where: [
        {
          brand_search: {
            id: In(JSON.parse(req.query.id)),
          },
        },
      ],
      skip: (req.query.page - 1) * 10,
      take: 10,
      relations: ["product"],
    });
    return res.send({ productBrandSearch });
  } catch (err) {
    return res.json({ success: false });
  }
});

// this 1 is by alternative and not brand
// app.get("/getAlternativeId", async (req, res) => {
//   // console.log(req.query.text.split(" "));
//   // @ts-ignore
//   const textArr = req.query.text.split(" ");
//   // Promise.all(textArr)
//   let arr = [];
//   for (let i = 0; i < textArr.length; i++) {
//     const alternative = Alternative.findOne({
//       // name: textArr[i]
//       where: {
//         name: Like(`%${textArr[i]}%`),
//       },
//     });
//     arr.push(alternative);
//   }
//   let result: any = [];
//   result = await Promise.all(arr);
//   console.log("fff1", result);
//   for (let i = 0; i < result.length; i++) {
//     if (result[i]) {
//       return res.json({ success: true, alternativeId: result[i].id });
//     }
//   }
//   return res.json({
//     success: false,
//     message: "could not find alternatives for this product",
//   });
// });

// app.get("/getAlternative", async (req, res) => {
//   const productAlternative = await ProductAlternative.find({
//     // @ts-ignore
//     where: { alternative: { id: req.query.id } },
//     // @ts-ignore
//     skip: (req.query.page - 1) * 10,
//     take: 10,
//     relations: ["product"],
//   });
//   return res.json({ success: true, alternative: productAlternative });
// });

app.get("/brand", async (req, res) => {
  try {
    const reqBrand = req.query.brand;
    if (!reqBrand) {
      return res.json({ success: true, brand: null });
    }
    console.log("asdsad", reqBrand);
    const brand = await Brand.findOneBy({ name: reqBrand as string });
    return res.json({ success: true, brand });
  } catch (err) {
    return res.json({ success: false });
  }
});

app.get("/brands", async (req, res) => {
  try {
    const reqBrand = req.query.text;
    if (!reqBrand) {
      return res.json({ success: true, brand: null });
    }
    const brands = await Brand.find({
      where: {
        name: ILike(`%${reqBrand}%`),
      },
      take: 10,
    });

    return res.json({ success: true, brands });
  } catch (err) {
    return res.json({ success: false });
  }
});

app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// app.listen(process.env.PORT, () => {
//   console.log("server started on localhost:4000");
// });
app.get("/csv-parse", (req, res, next) => {
  let csvArr: any = [];
  fs.createReadStream(
    "/home/ali/Desktop/albadeel/albadeel-backend/src/companies.csv"
  )
    .pipe(parser({ separator: ";" }))
    .on("data", (data) => {
      console.log("gggg", Object.keys(data));
      let obj: any = {};
      for (let i = 0; i < Object.keys(data).length; i++) {
        let dataObj = Object.keys(data)[i];
        if (dataObj) console.log(data[dataObj]);
        if (dataObj) obj[dataObj] = data[dataObj];
      }
      csvArr.push(obj);
      return;
    })
    .on("end", () => {
      console.log(JSON.stringify(csvArr));
      // [
      //   { NAME: 'Daffy Duck', AGE: '24' },
      //   { NAME: 'Bugs Bunny', AGE: '22' }
      // ]
    });
  res.send("hiii");
});

app.get("/insertKeywords", async (req, res, next) => {
  for (let i = 0; i < comapniesCsv.length; i++) {
    const brand = await Brand.findOneBy({ name: comapniesCsv[i].Company });
    console.log(brand?.id);
    console.log(comapniesCsv[i].Company);
    if (!brand) return;
    let keywords = comapniesCsv[i].Keywords.split(", ");
    for (let i = 0; i < keywords.length; i++) {
      const brandSearch = new BrandSearch();
      brandSearch.brand = brand;
      brandSearch.searchText = keywords[i];
      brandSearch.save();
    }

    // console.log(keywords);
    // brandSearch.searchText =
  }
});

app.get("/getRequest", (req, res, next) => {
  return res.send({ success: true });
});
console.log("asdjaskl");
app.post("/delete-account", async (req, res, next) => {
  try {
    const user = await User.findOneBy({ email: req.body.email });
    const password = user?.password;

    const comparePass = await bcrypt.compare(req.body.password, password);
    if (comparePass) {
      User.delete(user.id);
      return res.redirect("/delete-account");
    }
    return res.redirect("/delete-account");
  } catch (err) {
    return res.redirect("/delete-account");
  }
});

app.get("/testPuppeteer", async (req, res, next) => {
  try {
    const browser = await puppeteer.launch({
      ignoreDefaultArgs: ["--disable-extensions"],
    });
  } catch (err) {
    return res.send({ success: false, message: "an error has occured" });
  }
  return res.send({ success: true });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/privacy-policy", (req, res, next) => {
  console.log("ASdasd", path);
  console.log(path.join(__dirname, "public", "index.html"));
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/delete-account", (req, res, next) => {
  console.log("ASdasd", path);
  console.log(path.join(__dirname, "public", "form.html"));
  res.sendFile(path.join(__dirname, "public", "form.html"));
});

// app.post("/delete-account", (req, res, next) => {
//   res.send({ hi: "" });
// });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(process.env.PORT || 4000, () => {
  console.log("server started on localhost:4000");
});
