var fs        = require('fs');
var xmlStream = require('xml-stream');
var _ = require('lodash');
var stream=fs.createReadStream('PrixCarburants_quotidien_20150218.xml');
var xml = new xmlStream(stream);
var parsedObj = {};
var fuelTypes = {};

xml.collect('prix');
xml.on('endElement: pdv', function(gasStation) {
  if(!_.has(gasStation, 'prix')) {
    return;
  }
  var attrs = gasStation.$;
  var shortPostalCode = attrs.cp.substring(0, 2);

  var prices = gasStation.prix;
  _.forEach(prices, function(item) {

if(!item) {
return false;
}
    var price = item.$;
    if(!_.has(fuelTypes, price.id)) {
      fuelTypes[price.id] = price.nom;
    }
    var priceValue = parseInt(price.valeur, 10) / 1000.0;
if(isNaN(priceValue)) {
console.log(JSON.stringify(price.valeur));
}
    if(!_.has(parsedObj, shortPostalCode)) {
      var summedPrices = {};
      summedPrices[price.id] = {
        "count": 1,
        "totalValue": priceValue
      };
      parsedObj[shortPostalCode] = summedPrices;
    }
    else {
      if(!_.has(parsedObj[shortPostalCode], price.id)) {
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
//<prix nom="Gazole" id="1" maj="2015-02-18 06:12:58" valeur="1279"/>
  });




  
  
//  console.log(item);
})
xml.on('end', function() {
  console.log(parsedObj);
  console.log(fuelTypes);
});
