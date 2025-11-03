// scripts/fetchData.js
import fs from "fs";
import fetch from "node-fetch";

async function fetchAllFeatures() {
  const urlBase =
    "https://services6.arcgis.com/yG5s3afENB5iO9fj/arcgis/rest/services/NYVoterWaitTime_Public_View/FeatureServer/0/query";
  const pageSize = 2000;
  let resultOffset = 0;
  let allFeatures = [];

  while (true) {
    const url = `${urlBase}?where=1=1&outFields=*&f=json&resultOffset=${resultOffset}&resultRecordCount=${pageSize}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    const attributesArray = data.features.map((f) => f.attributes);
    allFeatures = allFeatures.concat(attributesArray);

    if (data.features.length < pageSize) break;

    resultOffset += pageSize;
  }

  return allFeatures;
}

async function main() {
  const data = await fetchAllFeatures();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputDir = "./data";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const filename = `${outputDir}/data-${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`✅ Saved ${data.length} records to ${filename}`);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
