import React, {useState, useEffect} from 'react';

import {render} from 'react-dom';
import {StaticMap, MapContext, NavigationControl} from 'react-map-gl';
import DeckGL from 'deck.gl';
import {TripsLayer, MVTLayer} from '@deck.gl/geo-layers';

function getData(inputData) {
  const velocityScaling = 20;

  const rawPositioned = inputData.filter(v => {
    // Avoid no-wind squares
    return [v.x, v.y].some(v => !isNaN(v));
  });

  // unique time values into an array?
  function getDomain(data) {
    return [...new Set(data.map(a => +a.time))].sort((a, b) => a - b);
  }

  const domain = getDomain(rawPositioned);

  function getPaths(rawPositioned, velocityScaling, domain) {
    return rawPositioned.map(row => {
      const position = [row.longitude, row.latitude];
      const path = interpolate(position, [
        position[0] + row.x / velocityScaling,
        position[1] + row.y / velocityScaling
      ]);

      return {
        path,
        times: interpolateTimes(domain.indexOf(+row.time) - 0.2)
      };
    });
  }

  function interpolateTimes(start) {
    let path = [start, start + 2];
    return path;
  }

  function interpolate(a, b) {
    let path = [...a];
    path.push(...b);
    return path;
  }

  const positioned = getPaths(rawPositioned, velocityScaling, domain);

  return positioned;
}

const INITIAL_VIEW_STATE = {
  latitude: 49,
  longitude: -124,
  zoom: 10
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';
const NAV_CONTROL_STYLE = {
  position: 'absolute',
  top: 10,
  left: 10
};

function Root() {
  const [currentTime, setCurrentTime] = useState(1);

  useEffect(() => {
    setTimeout(() => setCurrentTime((currentTime + 0.05) % 1.3), 70);
  }, [currentTime]);

  const loaderOptions = {
    mvt: {
      coordinates: 'wgs84',
      tileIndex: {
        x: 0,
        y: 0,
        z: 0
      }
    }
  };

  const tileLayer = new MVTLayer({
    data: ['/tiles/{z}/{x}/{y}.pbf'],
    maxRequests: 20,
    binary: false,
    loadOptions: loaderOptions,
    // https://wiki.openstreetmap.org/wiki/Zoom_levels
    minZoom: 6,
    maxZoom: 11,
    tileSize: 512,
    renderSubLayers: props => {
      if (props.data) {
        const d = props.data.map(feature => ({
          time: feature.properties.time,
          x: feature.properties.curr_x,
          y: feature.properties.curr_y,
          longitude: feature.properties.lon1,
          latitude: feature.properties.lat1
        }));
        const data = getData(d);

        // doubled up to make the animatin look more smooth
        return  [new TripsLayer({
            id: `layer-trips-x-1`,
            data,
            getPath: d => d.path,
            positionFormat: 'XY',
            getTimestamps: d => d.times,
            getColor: [25, 82, 189],
            opacity: 1,
            minZoom: 7,
            widthMinPixels: 2,
            fadeTrail: true,
            trailLength: 0.5,
            currentTime
        }),
        new TripsLayer({
            id: `layer-trips-x-2`,
            data,
            getPath: d => d.path,
            positionFormat: 'XY',
            getTimestamps: d => d.times,
            getColor: [25, 82, 189],
            opacity: .6,
            minZoom: 7,
            widthMinPixels: 2,
            fadeTrail: true,
            trailLength: 0.3,
            currentTime:(currentTime + 0.5) % 1.3
          })]
        
      }
    }
  });

  return (
    <div>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={tileLayer}
        ContextProvider={MapContext.Provider}
      >
        <StaticMap mapStyle={MAP_STYLE} />
        <NavigationControl style={NAV_CONTROL_STYLE} />
      </DeckGL>
    </div>
  );
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
// });
