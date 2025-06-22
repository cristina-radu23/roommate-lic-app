import NodeGeocoder from 'node-geocoder';

const options: NodeGeocoder.Options = {
  provider: 'openstreetmap',
  // Optional depending on the providers
  // fetch: customFetchImplementation,
  // apiKey: 'YOUR_API_KEY', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

export default geocoder; 