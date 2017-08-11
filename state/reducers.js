import { combineReducers } from 'redux';
import distance from '@turf/distance';
import centroid from '@turf/centroid';
import bbox from '@turf/bbox';
import {lineString} from '@turf/helpers';
import _ from 'underscore';

const trail = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_TRAIL':
      return {...state,
        hasBaseData: true,
        id: action.properties.id,
        name: action.properties.name,
        distance: action.properties.distance,
        center: [action.properties.cx, action.properties.cy]
      }
    case 'SET_TRAIL_PREVIEWING':
      return { ...state, previewing: (state.id === action.id) }
    case 'CLEAR_TRAIL_PREVIEWING':
      return { ...state, previewing: false }
    case 'TOGGLE_TRAIL_SELECTED':
      if (state.id === action.id && !action.selected){
        return { ...state, selected: true, selectedId: action.selectedTrailCount};
      }
      return state;
    case 'CLEAR_TRAIL_SELECTED':
      return { ...state, selected: false, selectedId: null }
    case 'SET_TRAIL_DATA':
      if (action.id !== state.id) return state
      const geometry = lineString(action.coordinates).geometry;
      return { ...state,
        hasElevationData: true,
        bounds: bbox(geometry),
        geometry: geometry,
        points: action.elevations.map((e, i) => {
          const p = action.elevations[i - 1];

          return {
            coordinates: e.coordinates,
            id: action.id,
            index: i,
            elevation: e.elevation,
            elevationGain: (p) ? Math.max(e.elevation - p.elevation, 0) : 0,
            elevationLoss: (p) ? Math.abs(Math.min(e.elevation - p.elevation, 0)) : 0,
            distanceFromPreviousPoint: (p) ? distance(e.coordinates, p.coordinates) * 1000 : 0
          }
        })
      }
    case 'SET_WEATHER_DATA':
      if (action.id !== state.id) return state
      return { ...state,
        hasWeatherData: true,
        maxTemperature: action["DLY-TMAX-NORMAL"].value,
        minTemperature: action["DLY-TMIN-NORMAL"].value,
        chanceOfPercipitation: action["DLY-PRCP-PCTALL-GE001HI"].value,
        chanceOfHeavyPercipitation: action["DLY-PRCP-PCTALL-GE050HI"].value,
        chanceOfSnow: action["DLY-SNOW-PCTALL-GE001TI"].value,
        chanceOfHeavySnow: action["DLY-SNOW-PCTALL-GE030TI"].value,
        chanceOfSnowPack: action["DLY-SNWD-PCTALL-GE001WI"].value,
        chanceOfHeavySnowPack: action["DLY-SNWD-PCTALL-GE010WI"].value
      }
    case 'UPDATE_HANDLE':
      if (!state.handles) return state;
      return {...state,
        handles: state.handles.map(p => handle(p, action)),
      }
    case 'SET_HANDLE_INDEX':
      if (!state.handles) return state;
      return {...state,
        handles: state.handles.map(p => handle(p, action)),
      }
    case 'SHOW_HANDLES':
      if (action.id !== state.id || !state.points) return state;
      return {...state, handles: [
        handle(null, {...action,
          point: state.points[0].coordinates,
          handleId: 0,
          index: 0
        }),
        handle(null, {...action,
          point: state.points[state.points.length - 1].coordinates,
          handleId: 1,
          index: state.points.length
        })
      ]}
    case 'CLEAR_HANDLES':
        return { ...state,
        handles: null
      }
    default: return state
  }
}

const trails = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TRAIL':
      if (state.some(t => t.id == action.properties.id)) return state;
      return [...state, trail(undefined, action)]
    case 'SET_TRAIL_PREVIEWING':
      return state.map(t => trail(t, action))
    case 'CLEAR_TRAIL_PREVIEWING':
      return state.map(t => trail(t, action))
    case 'TOGGLE_TRAIL_SELECTED':
      return state.map(t => trail(t, {...action, selectedTrailCount: state.filter(e => e.selected).length + 1}))
    case 'CLEAR_TRAIL_SELECTED':
      return state.map(t => trail(t, action))
    case 'SET_TRAIL_DATA':
      return state.map(t => trail(t, action))
    case 'SET_TRAIL_BASE_DATA':
      return state.map(t => trail(t, action))
    case 'SET_WEATHER_DATA':
      return state.map(t => trail(t, action))
    case 'SHOW_HANDLES':
      return state.map(t => trail(t, action))
    case 'CLEAR_HANDLES':
      return state.map(t => trail(t, action))
    case 'UPDATE_HANDLE':
      return state.map(t => trail(t, action))
    case 'SET_HANDLE_INDEX':
      return state.map(t => trail(t, action))
    default: return state
  }
}

const handle = (state = {}, action) => {
  switch (action.type) {
    case 'SET_TRAIL_DATA':
      return {
        coordinates: action.point,
        id: action.id + '-' + action.handleId,
        index: action.index,
        trailId: action.id
      }
    case 'SHOW_HANDLES':
      return {
        coordinates: action.point,
        id: action.id + '-' + action.handleId,
        index: action.index,
        trailId: action.id
      }
    case 'UPDATE_HANDLE':
      if (action.id !== state.id) return state;
      return {...state,
        coordinates: action.coordinates
      }
    case 'SET_HANDLE_INDEX':
      if (action.id !== state.id) return state;
      return {...state,
        index: action.index
      }
    default: return state
  }
}

const boundaries = (state = [], action) => {
  switch (action.type) {
    case 'ADD_BOUNDARY':
      if (state.some(b => b.id == action.properties.id)) return state;
      return [...state, boundary(undefined, action)]
    case 'SET_BOUNDARY_PREVIEWING':
      return state.map(b => boundary(b, action))
    case 'CLEAR_BOUNDARY_PREVIEWING':
      return state.map(b => boundary(b, action))
    case 'SET_BOUNDARY_SELECTED':
      return state.map(b => boundary(b, action))
    case 'CLEAR_BOUNDARY_SELECTED':
      return state.map(b => boundary(b, action))
    default: return state
  }
}

const boundary = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_BOUNDARY':
      return {...state,
        id: action.properties.id,
        name: action.properties.name,
        geometry: action.geometry
      }
    case 'SET_BOUNDARY_PREVIEWING':
      return { ...state, previewing: (state.id === action.properties.id) }
    case 'CLEAR_BOUNDARY_PREVIEWING':
      return { ...state, previewing: false }
    case 'SET_BOUNDARY_SELECTED':
      return { ...state, selected: (state.id === action.id)};
      return state;
    case 'CLEAR_BOUNDARY_SELECTED':
      return { ...state, selected: false }
    default: return state
  }
}

export default combineReducers({
  trails,
  boundaries
})
