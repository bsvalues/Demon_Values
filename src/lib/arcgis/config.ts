import { LayerManager } from './layers';

// Initialize layer manager with your ArcGIS service URL
export const layerManager = new LayerManager('https://services7.arcgis.com/NURlY7V8UHl6XumF/ArcGIS/rest/services');

// Add your Assessor Map layer
layerManager.addLayer({
  id: 'Assessor_Map_WFL1',
  name: 'Assessor Map',
  type: 'FeatureServer',
  enabled: true,
  fields: ['*'], // Request all fields
  renderer: {
    type: 'simple',
    symbols: [{
      type: 'simple-fill',
      color: [255, 0, 0, 0.2],
      outline: {
        color: [255, 0, 0, 1],
        width: 1
      }
    }]
  }
});

// Example of adding additional layers
layerManager.addLayer({
  id: 'Zoning',
  name: 'Zoning Districts',
  type: 'FeatureServer',
  enabled: false,
  fields: ['ZONE_TYPE', 'ZONE_DESC'],
  renderer: {
    type: 'unique-value',
    field: 'ZONE_TYPE',
    symbols: []
  }
});