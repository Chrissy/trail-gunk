const http = require('http');
const pg = require('pg');
const express = require('express');
const app = express();
const geolib = require('geolib');
const _ = require('underscore');

const db = require('./modules/db.js')

app.use(express.static('public'))

var pool = new pg.Pool({
  database: 'mountains_5',
  max: 10,
  idleTimeoutMillis: 3000
});

app.get('/api/:x1/:y1/:x2/:y2', function(request, response) {

  const query = `
    SELECT id, ST_AsGeoJson(geog) AS geog
    FROM trails
    WHERE ST_Intersects(geog,
      ST_MakeEnvelope(${request.params.x1}, ${request.params.y1}, ${request.params.x2}, ${request.params.y2})
    )
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();
      if (err) throw err;
      response.json(db.makeGeoJson(result));
    })
  })
})

app.get('/api/trails/:id', function(request, response) {
  const query = `
    SELECT name, surface, ST_AsGeoJson(geog) as geog, ST_Length(geog) as distance
    FROM trails
    WHERE id = ${request.params.id}
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
        "geography": JSON.parse(r.geog),
        "distance": r.distance
      });
    })
  })
})

app.get('/api/elevation/:id', function(request, response){
  const query = `
    select ST_AsGeoJson(geog) as geog
    FROM trails
    WHERE id = ${request.params.id}
  `

  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      if (err) throw err;

      var data = JSON.parse(result.rows[0].geog);
      var points = (data.type == "MultiLineString") ? _.flatten(data.coordinates, true) : data.coordinates;
      var altitudes = [], distance = 0;

      points.forEach(function(point, i) {
        const query = `
          SELECT ST_Value(rast, ST_Transform(
            ST_GeomFromText(
              'POINT(${point[0]} ${point[1]})',
            4326), 4326)
          )
          FROM elevation_2
          WHERE rid=4
        `;
        client.query(query, function(err, result){
          if (err) throw err;
          distance = (i == 0) ? 0 : distance + geolib.getDistance(point, points[i - 1]);
          if (result) altitudes.push([result.rows[0].st_value, distance]);
          if (i + 1 >= points.length) {
            done();
            response.json(altitudes);
          }
        })
      });
    });
  });
});

app.get('/api/boundaries/:x1/:y1/:x2/:y2', function(request, response) {
  const query = `
    SELECT gid AS id, ST_AsGeoJson(ST_Simplify(geog::geometry, 0.02)) AS geog
    FROM boundaries
    WHERE ST_Intersects(geog,
      ST_MakeEnvelope(${request.params.x1}, ${request.params.y1}, ${request.params.x2}, ${request.params.y2})
    )
  `
  pool.connect(function(err, client, done){
    client.query(query, function(err, result){
      done();
      if (err) throw err;
      response.json(db.makeGeoJson(result));
    });
  });
});

app.listen(5000, function () {
  console.log('listening on port 5000');
});
