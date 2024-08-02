/**
 * Master the flags data.
 * - Read all countries from countries.json
 * - rename image file and copy it to ./source/images
 * - optimize image file
 * - get location
 * - create new country-flags JSON data file
 */
import chalk from "chalk";
import fs from "fs-extra";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";

const config = {
    sourceDataFile: "./countries.json",
    sourceImages: "./source/images/",
    countryDataFile: "./source/country-flags.json",
    optimizedImages: "./source/optimized-images/"
};

/**
 * Read the countries JSON data file to discover all the country names and codes.
 * @returns {object} Country data
 */
async function loadCountryData () {
    const countryData = await import(config.sourceDataFile, {assert: {type: "json"}});
    if (countryData && countryData.default) {
        return countryData.default;
    }
    return null;
}

/**
 * Write the new country-flags JSON data file for each country.
 */
async function generateCountryDataJSONFile () {
    const countryData = await loadCountryData();
    let newCountryData = {};
    let countryCounter = 1;
    if (countryData) {
        for (const countryCode in countryData) {
            const countryName = countryData[countryCode];
            newCountryData[countryCode] = {
                name: countryName,
                code: countryCode.toLocaleLowerCase(),
                location: [0, 0],
                index: countryCounter,
                image: countryCounter.toString() + ".png"
            }
            await copyImage(countryCode, countryCounter);
            countryCounter += 1;
        }
    }
    fs.writeFile(config.countryDataFile, JSON.stringify(newCountryData, null, 2))
    await optimizeImages();
    console.log(chalk.blue("DONE"));
}

/**
 * Reduce file size of the copied images.
 */
async function optimizeImages () {
    try {
        const files = await imagemin([config.optimizedImages + "*.png"], {
            destination: config.optimizedImages,
            plugins: [
                imageminPngquant({
                    quality: [0.6, 0.8]
                })
            ]
        });
    } catch(optimizeError) {
        console.error(chalk.red(optimizeError.toString()));
    }
}

/**
 * Copy a countryCode image file to the destination image folder, rename it to its index
 * number, and optimize the image.
 * @param {string} countryCode Country code.
 * @param {Integer} countryCounter Country index number.
 * @returns 
 */
async function copyImage(countryCode, countryCounter) {
    const sourceImage = config.sourceImages + countryCode.toLowerCase() + ".png";
    const targetImage = config.optimizedImages + countryCounter.toString() + ".png";
    try {
        await fs.copy(sourceImage, targetImage);
    } catch(copyError) {
        console.error(chalk.red(copyError.toString()));
    }
    return;
}

generateCountryDataJSONFile();
