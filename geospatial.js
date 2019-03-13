function loadScript (src, callback) {
  var done = false
  var head = document.getElementsByTagName('head')[0]
  var script = document.createElement('script')
  script.onload = script.onreadlystatechange = function () {
    if (
      !done &&
      (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete')
    ) {
      done = true
      callback()
      script.onload = script.onreadystatechange = null
      if (head && script.parentNode) { head.removeChild(script) }
    }
  }
  script.src = src
  head.appendChild(script)
}

var clientUrl = document.location.href.split('?')[1]
if (!clientUrl) {
  clientUrl = 'https://hfu.github.io/iso3cd-geospatial/default.js'
}
console.log('loading ' + clientUrl)

loadScript(clientUrl, function () {
  expression = ['match', ['get', 'iso3cd']]
  cartotiles.data.forEach(function (row) {
    expression.push(row[0], cartotiles.color(row[1]))
  })
  expression.push(['rgb', 224, 224, 224])

  style = {
    'version': 8,
    'sprite': 'https://hfu.github.io/unite-sprite/sprite',
    'glyphs': 'https://vectortiles.xyz/fonts/{fontstack}/{range}.pbf',
    'sources': {
      'iso3cd': {
        'type': 'geojson',
        'data': 'https://hfu.github.io/iso3cd-scaffold/scaffold.geojson'
      }
    },
    'layers': [
      {
        'id': 'iso3cd-circle',
        'type': 'circle',
        'source': 'iso3cd',
        'layout': {},
        'paint': {
          'circle-radius': [
            'interpolate',
            [
              'exponential',
              2
            ],
            [
              'zoom'
            ],
            0,
            4,
            6,
            400
          ],
          'circle-color': expression
        }
      },
      {
        'id': 'iso3cd-symbol',
        'type': 'symbol',
        'source': 'iso3cd',
        'minzoom': 2,
        'layout': {
          'text-font': [
            'sans'
          ],
          'text-field': [
            'step',
            [
              'zoom'
            ],
            [
              'get',
              'iso3cd'
            ],
            4,
            [
              'get',
              'name'
            ]
          ]
        },
        'paint': {
          'text-color': [
            'rgb',
            255,
            255,
            255
          ]
        }
      }
    ]
  }

  map = new mapboxgl.Map({
    container: 'map',
    style: style,
    attributionControl: true,
    hash: true
  })

  map.on('load', function () {
    map.addControl(new mapboxgl.NavigationControl())
  })
  
  popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
  
  map.on('mouseenter', 'iso3cd-circle', function(e) {
    map.getCanvas().style.cursor = 'pointer'
    var coordinates = e.features[0].geometry.coordinates.slice()
    var description = e.features[0].properties
    
    popup.setLngLat(coordinates)
      .setHTML(description)
      .addTo(map)
  })
  
  map.on('mouseleave', 'iso3cd-circle', function() {
    map.getCanvas().style.cursor = ''
    popup.remove()
  })
})
