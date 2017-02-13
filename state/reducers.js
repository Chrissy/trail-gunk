import { combineReducers } from 'redux';

const trail = (state = {}, action) => {
  switch (action.type) {
    case 'ADD_TRAIL':
      return {...state, id: action.id}
    case 'SET_BASE_DATA':
      if (parseInt(action.trail.id) !== state.id) return state
      return {...state,
        name: action.trail.name,
        distance: action.trail.distance,
        center: action.trail.center,
        distance: action.trail.distance,
        geog: action.trail.geog,
        surface: action.trail.surface
      }
    case 'TOGGLE_PREVIEWING':
      return { ...state, previewing: (state.id === action.trail.id) }
    case 'CLEAR_PREVIEWING':
      return { ...state, previewing: false }
    case 'TOGGLE_SELECTED':
      if (state.id === action.trail.id && !action.trail.selected){
        return { ...state, selected: true, selectedId: action.selectedTrailCount};
      }
      return state;
    case 'CLEAR_SELECTED':
      return { ...state, selected: false, selectedId: null }
    case 'SET_ELEVATION_DATA':
      if (action.id !== state.id) return state
      return { ...state,
        hasElevationData: true,
        elevationGain: action.elevationChanges.elevationGain,
        elevationLoss: action.elevationChanges.elevationLoss,
        elevations: action.elevationChanges.elevations
      }
    case 'SET_WEATHER_DATA':
      if (action.id !== state.id) return state

      const convertToPercent = (integer) => parseInt(integer/10);
      const findByDatatype = (datatype) => (action.weatherData.find(node => node.datatype == datatype) || {}).value || "unknown";

      return { ...state,
        hasWeatherData: true,
        maxTemperature: findByDatatype("DLY-TMAX-NORMAL"),
        minTemperature: findByDatatype("DLY-TMIN-NORMAL"),
        chanceOfPercipitation: convertToPercent(findByDatatype("DLY-PRCP-PCTALL-GE001HI")),
        chanceOfHeavyPercipitation: convertToPercent(findByDatatype("DLY-PRCP-PCTALL-GE050HI")),
        chanceOfSnow: convertToPercent(findByDatatype("DLY-SNOW-PCTALL-GE001TI")),
        chanceOfHeavySnow: convertToPercent(findByDatatype("DLY-SNOW-PCTALL-GE030TI")),
        chanceOfSnowPack: convertToPercent(findByDatatype("DLY-SNWD-PCTALL-GE001WI")),
        chanceOfHeavySnowPack: convertToPercent(findByDatatype("DLY-SNWD-PCTALL-GE010WI"))
      }
    default: return state
  }
}

const trails = (state = [], action) => {
  switch (action.type) {
    case 'ADD_TRAIL':
      return [...state, trail(undefined, action)]
    case 'TOGGLE_PREVIEWING':
      return state.map(t => trail(t, action))
    case 'CLEAR_PREVIEWING':
      return state.map(t => trail(t, action))
    case 'TOGGLE_SELECTED':
      return state.map(t => trail(t, {...action, selectedTrailCount: state.filter(e => e.selected).length + 1}))
    case 'CLEAR_SELECTED':
      return state.map(t => trail(t, action))
    case 'SET_ELEVATION_DATA':
      return state.map(t => trail(t, action))
    case 'SET_BASE_DATA':
      return state.map(t => trail(t, action))
    case 'SET_WEATHER_DATA':
      return state.map(t => trail(t, action))
    default: return state
  }
}

const trailsDataUrl = (state = false, action) => {
  switch (action.type) {
    case 'SET_TRAILS_DATA_URL_BOUNDS':
      return `/api/${action.bounds._sw.lng}/${action.bounds._sw.lat}/${action.bounds._ne.lng}/${action.bounds._ne.lat}`
    default: return state
  }
}

export default combineReducers({
  trail,
  trails,
  trailsDataUrl
})
