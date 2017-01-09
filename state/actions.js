import fetch from 'isomorphic-fetch';
import _ from 'underscore'
import {createAltitudeQueryString} from '../modules/mapzenInterface';
import {cumulativeElevationChanges} from '../modules/cumulativeElevationChanges';

function getTrail(id) {
  return (dispatch, getState) => {
    let cachedTrail = getState().trails.find(trail => trail.id == id);
    if (cachedTrail) return Promise.resolve();

    return fetch(`/api/trails/${id}`)
      .then(response => response.json())
      .then(t => {
        let trail = Object.assign({}, t)
        trail.id = parseInt(trail.id);
        dispatch({type: 'ADD_TRAIL', trail});
        dispatch(getAltitudeData(trail));
      });
  }
}

// function getAltitudeData(trail) {
//   return dispatch => {
//     if (trail.hasElevationData) return Promise.resolve();
//     return fetch(createAltitudeQueryString(trail.geography.coordinates))
//       .then(response => response.json())
//       .then(altitudeData => {
//         let elevationChanges = cumulativeElevationChanges(altitudeData.range_height.map((e) => e[1]));
//         dispatch({type: 'SET_ELEVATION_DATA', elevationChanges, id: trail.id});
//       });
//   }
// }

function getAltitudeData(trail) {
  return dispatch => {
    if (trail.hasElevationData) return Promise.resolve();
    return fetch(`/api/elevation/${trail.id}`)
      .then(response => response.json())
      .then(altitudeData => {
        let elevationChanges = cumulativeElevationChanges(altitudeData);
        dispatch({type: 'SET_ELEVATION_DATA', elevationChanges, id: trail.id});
      });
  }
}


export function previewTrail(id) {
  return dispatch => {
    dispatch(getTrail(id)).then( trail => {
      return dispatch({type: 'TOGGLE_PREVIEWING', id});
    });
  }
}

export function selectTrail(id) {
  return dispatch => {
    dispatch(getTrail(id)).then( trail => {
      return dispatch({type: 'TOGGLE_SELECTED', id});
    });
  }
}