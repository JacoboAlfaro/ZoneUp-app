const appJson = require('./app.json');

/** La key de Maps se lee al prebuild (manifiesto nativo), no en el JS. */
module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [
      ...(appJson.expo.plugins ?? []),
      [
        'react-native-maps',
        {
          androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
        },
      ],
    ],
  },
};
