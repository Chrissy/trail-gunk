import {WebGLRenderer, Scene, PerspectiveCamera, TextureLoader, PlaneGeometry, MeshBasicMaterial, Mesh} from 'three';
import GeoViewport from '@mapbox/geo-viewport';
import _ from 'underscore';
import injectedJson from '../public/dist/terrain.json';

const accessToken =  'pk.eyJ1IjoiZml2ZWZvdXJ0aHMiLCJhIjoiY2lvMXM5MG45MWFhenUybTNkYzB1bzJ0MiJ9._5Rx_YN9mGwR8dwEB9D2mg';

const Terrain = ({height, width, canvas, bounds}) => {

  const getElevations = (bounds) => {
    return fetch(`/api/terrain/${bounds.join("/")}`).then(r => r.json());
  }

  const getEarth = () => {
    const {center: [x, y], zoom} = GeoViewport.viewport(bounds, [1024, 1024]);
    const url = `http://api.mapbox.com/v4/mapbox.satellite/${x},${y},${zoom}/1024x1024.jpg70?access_token=${accessToken}`;
    const loader = new TextureLoader();
    loader.crossOrigin = '';

    return new Promise((resolve, reject) => {
      loader.load(url, (image) => resolve(image))
    })
  }

  const makePlane = (earth, vertices) => {
    return new Promise((resolve, reject) => {
      const geometry = new PlaneGeometry(200, 200, 99, 99);
      const material = new MeshBasicMaterial({map: earth});
      const plane = new Mesh(geometry, material);

      plane.geometry.vertices.map((v,i) => {
        let z = vertices[i];
        if (z == null || z == NaN || z == undefined) {
          z = vertices[i - 1] || vertices[i + 1] || vertices[i - height] || vertices[i + height];
        };
        return Object.assign(v, { z: z / 100 })
      });

      plane.rotation.x = 5.7;

      return resolve(plane);
    });
  }

  const initializeCanvas = (plane) => {
    const scene = new Scene({autoUpdate: false});

    const camera = new PerspectiveCamera(42, 1, 0.1, 1000);
    camera.position.y = -20;
    camera.position.z = 200;

    const renderer = new WebGLRenderer({canvas: canvas});
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

    scene.add(plane);
    renderer.render(scene, camera);
  };

  const draw = () => {
    getEarth().then(earth => getElevations(bounds).then(elevations => makePlane(earth, elevations).then(plane => initializeCanvas(plane))));
  }

  draw();
};

const center = [-120.3189, 48.3698];
const bounds = GeoViewport.bounds(center, 12, [1024, 1024]);

Terrain({
  height: 800,
  width: 800,
  bounds,
  canvas: document.getElementById("canvas")
});
