var fs = require('fs'),
readline = require('readline'),
instream = fs.createReadStream('../Production-Department_of_Agriculture_and_Cooperation_1.csv'),
outstream = new (require('stream'))(),
rl = readline.createInterface(instream, outstream);

var cCMap={},
rSMap = {}, keystemp={};

var fGlist=['Agricultural Production Foodgrains Rice Kharif','Agricultural Production Foodgrains Rice Rabi','Agricultural Production Foodgrains Wheat Rabi','Agricultural Production Foodgrains Jowar Kharif','Agricultural Production Foodgrains Jowar Rabi','Agricultural Production Foodgrains Bajra Kharif','Agricultural Production Foodgrains Maize Kharif','Agricultural Production Foodgrains Maize Rabi','Agricultural Production Foodgrains Ragi Kharif','Agricultural Production Foodgrains Small Millets Kharif','Agricultural Production Foodgrains Barley Rabi','Agricultural Production Foodgrains Coarse Cereals','Agricultural Production Foodgrains Coarse Cereals Kharif','Agricultural Production Foodgrains Coarse Cereals Rabi','Agricultural Production Foodgrains Cereals Kharif','Agricultural Production Foodgrains Cereals Rabi','Agricultural Production Foodgrains Tur Kharif','Agricultural Production Foodgrains Other Kharif Pulses Kharif','Agricultural Production Foodgrains Gram Rabi','Agricultural Production Foodgrains Other Kharif Pulses Rabi','Agricultural Production Foodgrains Pulses Kharif','Agricultural Production Foodgrains Pulses Rabi'];
var oSlist=['Agricultural Production Oilseeds Groundnut Kharif','Agricultural Production Oilseeds Groundnut Rabi','Agricultural Production Oilseeds Castorseed Kharif','Agricultural Production Oilseeds Sesamun Kharif','Agricultural Production Oilseeds Nigerseed Kharif','Agricultural Production Oilseeds Rapeseed and Mustard Rabi','Agricultural Production Oilseeds Linseed Rabi','Agricultural Production Oilseeds Safflower Rabi','Agricultural Production Oilseeds Sunflower Kharif','Agricultural Production Oilseeds Sunflower Rabi','Agricultural Production Oilseeds Soyabean Kharif'];
var cClist=['Agricultural Production Commercial Crops Cotton','Agricultural Production Commercial Crops Jute','Agricultural Production Commercial Crops Mesta','Agricultural Production Commercial Crops Jute and Mesta','Agricultural Production Commercial Crops Sugarcane'];
var rSlist=['Agricultural Production Foodgrains Rice Volume Karnataka','Agricultural Production Foodgrains Rice Volume Kerala','Agricultural Production Foodgrains Rice Volume Tamil Nadu','Agricultural Production Foodgrains Rice Volume Andhra Pradesh'];

var inputArray = [],
foodGrains =[],
oilSeeds =[],
heading=[],
commercialCropsData=[],
riceVolumeStateData=[];
rl.on('line', function (line) {
  inputArray = line.split(',');
  if(inputArray[0]=='Particulars'){
    heading=inputArray;
  }else if( fGlist.indexOf(inputArray[0])!=-1){
    var data;
    //if(inputArray[0]!='Agricultural Production Foodgrains'){
      data={
        "key"  : inputArray[0].substr(35),
        "value" : inputArray[24]
      }
      foodGrains.push(data);
    //}
  }else if(oSlist.indexOf(inputArray[0])!=-1){
    var data;
    data={
        "key"  : inputArray[0].substr(33),
        "value" : inputArray[24]
      }
      oilSeeds.push(data);
  } else if(cClist.indexOf(inputArray[0])!=-1){
    var arrayTempData=[];

    for (var i = 3; i < heading.length; i++) {
      var yrValue;
      if(inputArray[i+1]=="NA"){
        yrValue =0;
      }else{
        if(inputArray[3]=="Ton mn"){
          yrValue=inputArray[i+1];
        }else{
          yrValue=(inputArray[i+1]*24)/100
        }
      }
      if(heading[i] in cCMap){
        cCMap[heading[i]]=parseFloat(cCMap[heading[i]])+parseFloat(yrValue);
      }else{
        cCMap[heading[i]]=yrValue;
      }
    }
    keystemp=Object.keys(cCMap);
    var cropsCount = cClist.length;
    for (var i = 0; i < keystemp.length; i++) {
      var data={
        'key':keystemp[i].substr(3),
        'value':parseFloat(cCMap[keystemp[i]])/cropsCount
      }
      commercialCropsData.push(data);
    }
  }else if(rSlist.indexOf(inputArray[0])!=-1){
    var arrayTempData=[];
    var state=inputArray[0].substr(47);
    for (var i = 14; i < heading.length; i++) {
      var yrValue;
      if(inputArray[i+1]=="NA"){
        yrValue =0;
      }else{
        yrValue=inputArray[i+1];
      }
      if(heading[i] in rSMap){
        var tempMap={};
        tempMap = rSMap[heading[i]];
        tempMap[state] = parseFloat(yrValue);
        rSMap[heading[i]]=tempMap;
      }else{
        var tempMap={};
        tempMap["key"] = heading[i].trim();
        tempMap[state] = parseFloat(yrValue);
        rSMap[heading[i]]=tempMap;
      }
    }
    keystemp=Object.keys(rSMap);
    for (var i = 0; i < keystemp.length; i++) {
      riceVolumeStateData.push(rSMap[keystemp[i]]);
    }
  }
});

rl.on('close', function (line) {

  fs.writeFile('../json/oilSeedData.json', JSON.stringify(oilSeeds), function(err) {
  });
  fs.writeFile('../json/FoodCropsData.json', JSON.stringify(foodGrains), function(err) {
  });
  fs.writeFile('../json/commercialCropsData.json', JSON.stringify(commercialCropsData), function(err) {
  });
  fs.writeFile('../json/riceVolumeData.json', JSON.stringify(riceVolumeStateData), function(err) {
  });
});
