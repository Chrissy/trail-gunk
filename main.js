var React = require('react');
var ReactDOM = require('react-dom');
var MapboxGL = require('mapbox-gl');

MapboxGL.accessToken = 'pk.eyJ1IjoiZml2ZWZvdXJ0aHMiLCJhIjoiY2lvMXM5MG45MWFhenUybTNkYzB1bzJ0MiJ9._5Rx_YN9mGwR8dwEB9D2mg'

var Map = React.createClass({

  watchEvents: {
    'onMapLoad': 'load',
    'onMapMoveEnd': 'moveend'
  },

  loadTrailsWithinBox: function(){
    var bounds = this.mapboxed.getBounds();

    this.mapboxed.addSource('trails-data', {
      'type': 'geojson',
      'data': `/api/${bounds._sw.lng}/${bounds._sw.lat}/${bounds._ne.lng}/${bounds._ne.lat}`
    })

    var defaultLayerObject = {
      'id': 'trails',
      'source': 'trails-data',
      'type': 'line',
      'paint': {
        'line-color': '#47B05A',
        'line-width': 4
      }
    }

    var activeLayerObject = Object.assign({}, defaultLayerObject, {
      'id': 'trails-active',
      'paint': { 'line-color': '#FF9100'},
      "filter": ["==", "id", ""]
    })

    this.mapboxed.addLayer(defaultLayerObject).addLayer(activeLayerObject)
  },

  removeTrails: function() {
    this.mapboxed.removeSource('trails-data');
    this.mapboxed.removeLayer('trails');
    this.mapboxed.removeLayer('trails-active');
  },

  onMapLoad: function() {
    this.loadTrailsWithinBox();
  },

  onMapMoveEnd: function() {
    this.removeTrails();
    this.loadTrailsWithinBox();
  },

  getInitialState: function() {
    return {}
  },

  componentDidMount: function() {
    this.mapboxed = new MapboxGL.Map({
      container: 'mapbox-gl-element',
      style: 'mapbox://styles/mapbox/outdoors-v9',
      center: [-118.6686774, 36.7933829],
      zoom: 10
    });

    this._mapEvents()
  },

  _mapEvents: function() {
    Object.keys(this.watchEvents).forEach(function(functionName){
      this.mapboxed.on(this.watchEvents[functionName], function(){
        if (this.mapboxed.loaded()) this[functionName].call()
      }.bind(this))
    }.bind(this))
  },

  render: function() {
    return (
      <div id="mapbox-gl-element"></div>
    );
  }
})

ReactDOM.render(<Map />, document.getElementById("map"));
