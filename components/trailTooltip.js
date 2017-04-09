import React from 'react'
import {metersToMiles, convertToTitleCase} from '../modules/conversions'
import lineDistance from '@turf/line-distance'
import {feature} from '@turf/helpers'

export default class TrailTooltip extends React.Component {
  render() {
    const trailName = this.props.trail.name;

    return (
      <span>
        name: {convertToTitleCase(trailName == 'null' ? 'unknown' : trailName)}<br/>
        distance: {metersToMiles(lineDistance(feature(this.props.trail.geometry)) * 1000)} Miles<br/>
        id: {this.props.trail.id}
      </span>
    )
  }
};
