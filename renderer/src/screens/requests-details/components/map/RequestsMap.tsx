import React from 'react'
import { ComposableMap, Geographies, Geography, Line, Marker } from "react-simple-maps"

// Models
import { RequestCycle } from '../../../../models'

// Style
import './RequestsMap.css'
import { GeoLocation } from '../../../../models/request-cycle'

const RequestsMap = ({ cycles }: { cycles: RequestCycle[] }) => {
  const geoUrl = "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json"

  const geoLocations = cycles.filter(cycle => cycle.geoLocation !== undefined).map(cycle => cycle.geoLocation!)
  const filteredLocations = uniqueLocations(geoLocations)
  const filteredDestinations = filteredLocations.map(location => location.destination)

  return (
    <div>
      <ComposableMap>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map(geo => <Geography key={geo.rsmKey} geography={geo} fill="#2F2E3A" stroke="#1F1F1F" />)
          }
        </Geographies>
        {
          filteredLocations.map(location =>
            <Line
              key={location.toString()}
              className="HighlightedLine"
              from={[location.source.longitude, location.source.latitude]}
              to={[location.destination.longitude, location.destination.latitude]}
              strokeWidth={1}
              strokeLinecap="round"></Line>
          )
        }
        {
          filteredDestinations.map(destination =>
            <Marker
              coordinates={[destination.longitude, destination.latitude]}
              key={destination.toString()}
            >
              <circle className="HighlightedCircle" r={5} />
            </Marker>
          )
        }
      </ComposableMap>
    </div>
  )
}

function uniqueLocations(locations: GeoLocation[]): GeoLocation[] {
  let uniqueLocations: GeoLocation[] = []

  locations.forEach(location => {
    if (!uniqueLocations.find(loc => loc.destination.toString() === location.destination.toString())) {
      uniqueLocations.push(location)
    }
  })

  return uniqueLocations
}

export default RequestsMap