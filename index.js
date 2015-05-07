var fs = require('fs');
var xmlStream = require('xml-stream');
var _ = require('lodash');
var async = require('async');

var stream = fs.createReadStream('PrixCarburants_quotidien_20150218.xml');
var xml = new xmlStream(stream);
var parsedObj = {};
var fuelTypes = {};

var computeAveragePriceByFuelType = function (fuelType) {
    fuelType.averagePrice = fuelType.totalValue / fuelType.count;
};

var computeAveragePriceByDepartement = function (departement) {
    _.forEach(departement, computeAveragePriceByFuelType);
};

var computePrices = function (item) {
    var shortPostalCode = this;

    if (!item) {
        return false;
    }
    var price = item.$;
    if (!_.has(fuelTypes, price.id)) {
        fuelTypes[price.id] = price.nom;
    }
    var priceValue = parseInt(price.valeur, 10) / 1000.0;
    if (isNaN(priceValue)) {
        console.log(JSON.stringify(price.valeur));
    }
    if (!_.has(parsedObj, shortPostalCode)) {
        var summedPrices = {};
        summedPrices[price.id] = {
            "count": 1,
            "totalValue": priceValue
        };
        parsedObj[shortPostalCode] = summedPrices;
    }
    else {
        if (!_.has(parsedObj[shortPostalCode], price.id)) {
            parsedObj[shortPostalCode][price.id] = {
                "count": 1,
                "totalValue": priceValue
            }
        }
        else {
            parsedObj[shortPostalCode][price.id].count += 1;
            parsedObj[shortPostalCode][price.id].totalValue += priceValue;
        }

    }
    _.forEach(parsedObj, computeAveragePriceByDepartement);
};

var startWaterfall = function (callback) {
    callback(null);
};

var writePricesToFile = function (callback) {
    fs.writeFile("pricesByDepartments.json", JSON.stringify(parsedObj), callback);
};

var writeFuelTypesToFile = function (callback) {
    fs.writeFile("fuelTypes.json", JSON.stringify(fuelTypes), callback);
};

var applicationEnd = function (err) {
    console.log("Ended.");
};

xml.collect('prix');
xml.on('endElement: pdv', function (gasStation) {
    if (!_.has(gasStation, 'prix')) {
        return;
    }
    var attrs = gasStation.$;
    var shortPostalCode = attrs.cp.substring(0, 2);

    var prices = gasStation.prix;
    _.forEach(prices, computePrices, shortPostalCode);
});
xml.on('end', function () {
    async.waterfall([
        startWaterfall,
        writePricesToFile,
        writeFuelTypesToFile,
    ], applicationEnd);
});
