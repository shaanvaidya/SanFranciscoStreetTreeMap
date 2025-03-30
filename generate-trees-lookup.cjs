const fs = require('fs');

const inputPath = 'trees.geojson';
const outputPath = 'trees-lookup.json';

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const simplified = raw.features.map((f) => {
    const p = f.properties;
    return {
        id: p.id,
        species: p.species,
        address: p.address,
        dbh: p.dbh,
        plantDate: p.plantDate,
        siteInfo: p.siteInfo,
        legalStatus: p.legalStatus,
        neighborhood: p.neighborhood,
        color: p.color,
        latitude: p.latitude,
        longitude: p.longitude,
        neighborhood_name: p.neighborhood_name,
    };
});

fs.writeFileSync(outputPath, JSON.stringify(simplified, null, 2));
console.log(`✅ Wrote ${simplified.length} trees to ${outputPath}`);
