const http = require('http');
const pg = require('pg');
const express = require('express');
const app = express();

app.use(express.static('public'))

var pool = new pg.Pool({
  database: 'mountains_2',
  max: 10,
  idleTimeoutMillis: 3000
});

app.get('/api/:x1/:y1/:x2/:y2', function(request, response) {

  let query = `
    SELECT ogc_fid, ST_AsGeoJson(the_geog) AS the_geog
    FROM osm_trails
    WHERE ST_Intersects(the_geog,
      ST_MakeEnvelope(${request.params.x1}, ${request.params.y1}, ${request.params.x2}, ${request.params.y2})
    )
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();

      if (err) throw err;

      var features = []

      for (var row of result.rows) {
        features.push({
          "type": "Feature",
          "properties": {
            "id": row.ogc_fid
          },
          "geometry": JSON.parse(row.the_geog)
        });
      }

      response.json({
        "type": "FeatureCollection",
        "features": features
      });
    })
  })
})

app.get('/api/trails/:id', function(request, response) {
  let query = `
    SELECT name, surface, ST_AsGeoJson(the_geog) as the_geog, ST_Length(the_geog) as distance
    FROM osm_trails
    WHERE ogc_fid = ${request.params.id}
    LIMIT 1
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();

      if (err) throw err;

      let r = result.rows[0]

      response.json({
        "name": r.name,
        "id": request.params.id,
        "surface": r.surface,
        "geography": JSON.parse(r.the_geog),
        "distance": r.distance
      });
    })
  })
})

app.get('/api/elevation/:id', function(request, response){
  let query = `
    select ST_AsGeoJson(the_geog) as the_geog
    FROM osm_trails
    WHERE ogc_fid = ${request.params.id}
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      if (err) throw err;

      let r = result.rows[0];
      let points = JSON.parse(r.the_geog).coordinates;
      const altitudes = []
      points.forEach(function(point, i) {
        let query = `
          SELECT ST_Value(rast, ST_Transform(
            ST_GeomFromText(
              'POINT(${point[0]} ${point[1]})',
            4326), 4326)
          )
          FROM elevation_GMTED2010N30W120_150
          WHERE rid=4
        `;
        client.query(query, function(err, result){
          if (err) throw err;
          if (result) altitudes.push(result.rows[0].st_value)
          if (i + 1 >= points.length) {
            done();
            response.json(altitudes);
          }
        })
      });
    });
  });
});

app.listen(5000, function () {
  console.log('listening on port 5000');
});
