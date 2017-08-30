import React, { Proptypes } from 'react';
import MapboxGL from 'mapbox-gl';
import bbox from '@turf/bbox';
import helpers from '@turf/helpers';
import {accessToken, styleUrl} from '../modules/mapboxStaticData';
import styles from '../styles/mapbox.css';
import mapboxStyles from '../public/dist/mapbox-styles.json';
const WATCH_EVENTS = ['mousedown','mouseup','click','dblclick','mousemove','mouseenter', 'mouseleave','mouseover','mouseout','contextmenu','touchstart','touchend','touchcancel'];

export default class MapBox extends React.PureComponent {

  updateSources(oldSources = [], newSources = []) {
    newSources.forEach(function(source) {
      this.mapboxed.getSource(source.id).setData(source.data);
    }.bind(this))
  }

  updateFilters(filters) {
    filters.forEach(f => {
      this.mapboxed.setFilter(f.id, f.filter);
    });
  }

  fitToFilter(filterObj) {
    const elements = this.mapboxed.queryRenderedFeatures(filterObj);
    if (!elements.length) return;
    const combinedFeatures = helpers.featureCollection(elements);
    this.mapboxed.fitBounds(bbox(combinedFeatures));
  }

  componentDidMount() {
    MapboxGL.accessToken = accessToken;

    this.mapboxed = new MapboxGL.Map({
      container: 'mapbox-gl-element',
      style: mapboxStyles,
      center: [-123.6, 47.8],
      zoom: 9,
      maxZoom: 14
    });

    this.mapEvents();
    this.mapboxed.addControl(new MapboxGL.NavigationControl());
  }

  componentDidUpdate(prevProps, q) {
    this.updateSources(prevProps.sources, this.props.sources);

    if (this.props.filters && prevProps.filters !== this.props.filters) {
      this.updateFilters(this.props.filters);
    }

    if (this.props.fitToFilter && prevProps.fitToFilter !== this.props.fitToFilter) {
      this.fitToFilter(this.props.fitToFilter)
    }

    this.mapboxed.getCanvas().style.cursor = (this.props.pointer) ? 'pointer' : '';
  }

  mapEvents() {
    WATCH_EVENTS.forEach((eventName) => {
      if (!this.props[eventName]) return;
      this.mapboxed.on(eventName, (event) => {
        this.props[eventName](Object.assign({}, event, {
          bounds: this.mapboxed.getBounds().toArray(),
          zoom: this.mapboxed.getZoom(),
          features: (event.point) ? this.mapboxed.queryRenderedFeatures(event.point, { layers: this.props.watchLayers }) : null
        }));
      });
    });
  }

  render() {
    return (
      <div className={styles.body} id="mapbox-gl-element"></div>
    );
  }
}
