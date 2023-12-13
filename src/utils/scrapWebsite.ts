import puppeteer from "puppeteer-extra";
import { Alternative } from "../entity/Alternative";
import * as cheerio from "cheerio";
import { Product } from "../entity/Product";
import { ProductAlternative } from "../entity/ProductAlternative";
import { ProductBrand } from "../entity/ProductBrand";
import { Brand } from "../entity/Brand";
import { AppDataSource } from "../data-source";
import { BrandSearch } from "../entity/BrandSearch";
import { ProductBrandSearch } from "../entity/ProductBrandSearch";
import { ProductAlternativeSearch } from "../entity/ProductAlternativeSearch";
import { AlternativeSearch } from "../entity/AlternativeSearch";

function incrementLastNumberInUrl(url: string) {
  // Match the last number in the URL using a regular expression
  let match = url.match(/\/(\d+)(?:\/)?$/);

  if (match && match[1]) {
    // Extract the matched number, increment it by 1, and replace it in the URL
    let incrementedNumber = parseInt(match[1]) + 1;
    let newUrl = url.replace(/\/\d+(?:\/)?$/, "/" + incrementedNumber);
    return newUrl;
  } else {
    // If no number is found, return the original URL
    return url;
  }
}

function escapeSelector(text: string) {
  // Replace special characters with their escaped versions
  return text.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
}

async function insertIntoProductAlternative(
  productId: number,
  alternativeId: number,
  alternativeSearchId: number
): Promise<void> {
  // Assuming you have product and alternative ids, you can insert into the join table like this
  const product = await Product.findOneBy({ id: productId });
  const alternative = await Alternative.findOneBy({ id: alternativeId });
  const alternativeSearch = await AlternativeSearch.findOneBy({
    id: alternativeSearchId,
  });

  const productAlternative = new ProductAlternative();
  if (alternative) productAlternative.alternative = alternative;

  if (product) productAlternative.product = product;
  if (product && alternative) {
    const existingProductAlternative = await ProductAlternative.findOne({
      where: {
        alternative: { id: alternativeId },
        product: { id: productId },
      },
    });
    if (!existingProductAlternative) await productAlternative.save();
  }

  const productAlternativeSearch = new ProductAlternativeSearch();
  if (alternativeSearch)
    productAlternativeSearch.alternative_search = alternativeSearch;

  if (product) productAlternativeSearch.product = product;
  if (product && alternativeSearch) {
    const existingProductAlternativeSearch =
      await ProductAlternativeSearch.findOne({
        where: {
          alternative_search: { id: alternativeSearchId },
          product: { id: productId },
        },
        // where: {
        //   brand: brand,
        //   product: product,
        // },
      });
    if (!existingProductAlternativeSearch)
      await productAlternativeSearch.save();
  }
}

export const scrapeWebsite = async (
  url: string,
  id: number,
  alternativeSearchId: number
) => {
  const lastUrlCount = url.split("/")[url.split("/").length - 1];
  // const alternativeProduct = await Alternative.findOneBy({ id });

  // const alternativeP = new Alternative();
  // let alternativeId = -1;
  // if (!alternativeProduct) {
  //   alternativeP.name = name;
  //   await alternativeP.save();
  //   alternativeId = alternativeP.id;
  // } else {
  // alternativeId = alternativeProduct?.id || -1;
  // }
  let alternativeId = id;

  // setTimeout(() => {
  //   if (+lastUrlCount === 1) {
  //     console.log("ASdasdasdas");
  //     if (!alternativeProduct) {
  //     }
  //     return;
  //   }
  //   console.log(lastUrlCount);
  //   console.log(incrementLastNumberInUrl(url));
  // }, 5000);
  // return;
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  await page.goto(url);

  // Get the HTML content of the page
  const htmlContent = await page.content();

  const $ = cheerio.load(htmlContent);
  const allProducts = $("#product-search-results li");
  console.log("ggggggggg", allProducts);

  const products = $(".product-search-item-text");
  allProducts.each(function () {
    console.log("hiiiii");
    const product = new Product();
    let a = $(this).find("p").text();
    let pTagCount = $(this).find("p").length;

    for (let i = 0; i < pTagCount; i++) {
      const text = $(this).find(`p:eq(${i})`).text();

      if (text.startsWith("Barcode: ")) {
        // console.log(text.split("Barcode: ")[1]);
        product.barcode = text.split("Barcode: ")[1];
      } else {
        if (text.startsWith("Category: ")) {
          // console.log(text.split("Category: ")[1]);
          product.category = text.split("Category: ")[1];
        } else {
          if (text.startsWith("Manufacturer: ")) {
            // console.log(text.split("Manufacturer: ")[1]);
            product.manufacturer = text.split("Manufacturer: ")[1];
          } else {
            if (text.startsWith("Brand: ")) {
              // console.log(text.split("Brand: ")[1]);
              product.brand = text.split("Brand: ")[1];
            } else {
              // const imgTags = $(`img`);
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
    Product.findOneBy({ barcode: product.barcode })
      .then((res) => {
        if (res) {
          console.log("asdasdsad", res.id);
          insertIntoProductAlternative(
            res.id,
            alternativeId,
            alternativeSearchId
          );
          // insert here using res.id & alternativeId
        } else {
          product
            .save()
            .then((res) => {
              console.log("bbbbbbbbbbb", res);
              insertIntoProductAlternative(
                res.id,
                alternativeId,
                alternativeSearchId
              );
              // insert here using res.id & alternativeId
            })
            .catch((err) => {});
        }
      })
      .catch((err) => {});
    console.log(product);
    try {
      //   product.save();
    } catch (err) {}

    // console.log(pTagCount);
    // const thirdTag = $(this).find("p:eq(2)").text();
    // console.log("thirdTag", thirdTag);
    // console.log("kkk", a);
  });
  const linkExists = $(`a[href="${incrementLastNumberInUrl(url)}"]`).length > 0;
  console.log("asdas", linkExists);
  if (linkExists) {
    await scrapeWebsite(incrementLastNumberInUrl(url), id, alternativeSearchId);
  } else {
    await AlternativeSearch.save({
      id: alternativeSearchId,
      completed: true,
    });
  }

  // You can now do something with the HTML content, such as saving it to a file or processing it further
  // console.log(htmlContent);

  await browser.close();
};

async function insertIntoProductBrand(
  productId: number,
  brandId: number,
  brandSearchId: number
): Promise<void> {
  // Assuming you have product and alternative ids, you can insert into the join table like this
  const product = await Product.findOneBy({ id: productId });
  const brand = await Brand.findOneBy({ id: brandId });
  const brandSearch = await BrandSearch.findOneBy({ id: brandSearchId });

  const productBrand = new ProductBrand();
  if (brand) productBrand.brand = brand;

  if (product) productBrand.product = product;
  if (product && brand) {
    const existingProductBrand = await ProductBrand.findOneBy({
      brand: { id: brandId },
      product: { id: productId },
      // where: {
      //   brand: brand,
      //   product: product,
      // },
    });
    if (!existingProductBrand) await productBrand.save();
  }

  const productBrandSearch = new ProductBrandSearch();
  if (brandSearch) productBrandSearch.brand_search = brandSearch;

  if (product) productBrandSearch.product = product;
  if (product && brandSearch) {
    const existingProductBrandSearch = await ProductBrandSearch.findOne({
      where: {
        brand_search: { id: brandSearchId },
        product: { id: productId },
      },
      // where: {
      //   brand: brand,
      //   product: product,
      // },
    });
    if (!existingProductBrandSearch) await productBrandSearch.save();
  }
}

export const scrapeBrand = async (
  url: string,
  brandId: number,
  brandSearchId: number
  // alternative: string
) => {
  // const lastUrlCount = url.split("/")[url.split("/").length - 1];
  // const alternativeProduct = await Alternative.findOneBy({ name });
  // // const brandId

  // const alternativeP = new Alternative();
  // let alternativeId = -1;
  // if (!alternativeProduct) {
  //   alternativeP.name = name;
  //   await alternativeP.save();
  //   alternativeId = alternativeP.id;
  // } else {
  //   alternativeId = alternativeProduct?.id || -1;
  // }
  // start from here, alternativeId should get to brandId

  // setTimeout(() => {
  //   if (+lastUrlCount === 1) {
  //     console.log("ASdasdasdas");
  //     if (!alternativeProduct) {
  //     }
  //     return;
  //   }
  //   console.log(lastUrlCount);
  //   console.log(incrementLastNumberInUrl(url));
  // }, 5000);
  // return;
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions"],
  });
  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);

  await page.goto(url);

  // Get the HTML content of the page
  const htmlContent = await page.content();

  const $ = cheerio.load(htmlContent);
  const allProducts = $("#product-search-results li");
  console.log("ggggggggg", allProducts);

  const products = $(".product-search-item-text");
  allProducts.each(function () {
    console.log("hiiiii");
    const product = new Product();
    let a = $(this).find("p").text();
    let pTagCount = $(this).find("p").length;

    for (let i = 0; i < pTagCount; i++) {
      const text = $(this).find(`p:eq(${i})`).text();

      if (text.startsWith("Barcode: ")) {
        // console.log(text.split("Barcode: ")[1]);
        product.barcode = text.split("Barcode: ")[1];
      } else {
        if (text.startsWith("Category: ")) {
          // console.log(text.split("Category: ")[1]);
          product.category = text.split("Category: ")[1];
        } else {
          if (text.startsWith("Manufacturer: ")) {
            // console.log(text.split("Manufacturer: ")[1]);
            product.manufacturer = text.split("Manufacturer: ")[1];
          } else {
            if (text.startsWith("Brand: ")) {
              // console.log(text.split("Brand: ")[1]);
              product.brand = text.split("Brand: ")[1];
            } else {
              // const imgTags = $(`img`);
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
    Product.findOneBy({ barcode: product.barcode })
      .then((res) => {
        if (res) {
          console.log("asdasdsad", res.id);
          insertIntoProductBrand(res.id, brandId, brandSearchId);
          // insert here using res.id & alternativeId
        } else {
          product
            .save()
            .then((res) => {
              console.log("bbbbbbbbbbb", res);
              insertIntoProductBrand(res.id, brandId, brandSearchId);
              // insert here using res.id & alternativeId
            })
            .catch((err) => {});
        }
      })
      .catch((err) => {});
    console.log(product);
    try {
      //   product.save();
    } catch (err) {}

    // console.log(pTagCount);
    // const thirdTag = $(this).find("p:eq(2)").text();
    // console.log("thirdTag", thirdTag);
    // console.log("kkk", a);
  });

  // console.log(incrementLastNumberInUrl(url));
  // return;
  const linkExists = $(`a[href="${incrementLastNumberInUrl(url)}"]`).length > 0;
  console.log("asdas", linkExists);
  if (linkExists) {
    await scrapeBrand(incrementLastNumberInUrl(url), brandId, brandSearchId);
  } else {
    await BrandSearch.save({
      id: brandSearchId,
      completed: true,
    });
  }

  // You can now do something with the HTML content, such as saving it to a file or processing it further
  // console.log(htmlContent);

  await browser.close();
};
