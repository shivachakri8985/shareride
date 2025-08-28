const axios = require("axios");
const captainModel = require("../models/captain.model");

const apiKey = process.env.GOOGLE_MAPS_API;

module.exports.getAddressCoordinate = async (address) => {
  if (!address) throw new Error("Address is required");

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      const location = response.data.results[0].geometry.location;
      console.log("from getAddress : ",location);
      return {
        lat: location.lat, // ✅ Fixed typo from "ltd"
        lng: location.lng,
      };
    } else {
      throw new Error("Unable to fetch coordinates");
    }
  } catch (error) {
    console.error("Error in getAddressCoordinate:", error.message);
    throw error;
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) throw new Error("Origin and destination are required");
  //console.log("getDIstanceTIme : ",origin," - ",destination);
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
   // console.log(response);
    if (response.data.status === "OK") {
      const element = response.data.rows[0].elements[0];
      if (element.status === "ZERO_RESULTS") throw new Error("No routes found");
      return element;
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error("Error in getDistanceTime:", err.message);
    throw err;
  }
};


const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API;
module.exports.getAutoCompleteSuggestions = async (input) => {
  try {
    const response = await axios.post(
      "https://places.googleapis.com/v1/places:autocomplete",
      { input },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": "*",
        },
      }
    );

    const suggestions = response.data.suggestions || [];
    // Return as array of strings for frontend compatibility
    const formatted = suggestions.map((s) => {
      const pred = s.placePrediction;
      // Combine mainText and secondaryText for display, fallback to fullText
      const main = pred.structuredFormat?.mainText?.text || pred.text?.text || "";
      const secondary = pred.structuredFormat?.secondaryText?.text || "";
      if (main && secondary) return `${main}, ${secondary}`;
      return main || secondary || pred.fullText || "";
    });

    return formatted;
  } catch (error) {
    console.error("Autocomplete Error: Unable to fetch suggestions");
    console.dir(error.response?.data || error, { depth: null });
    throw new Error("Autocomplete failed");
  }
};


// module.exports.getCaptainsInTheRadius = async (lat, lng, radius, vehicleType) => {
//   console.log(lat, lng, radius, vehicleType);
//   try {
//     const captains = await captainModel.find({
//       location: {
//         $geoWithin: {
//           $centerSphere: [[lat, lng], radius / 6371], // radius in radians
//         },
//       },
//       "vehicle.type": vehicleType,
//     });
//     return captains;
//   } catch (error) {
//     console.error("Error in getCaptainsInTheRadius:", error.message);
//     throw new Error("Error getting captains in radius");
//   }
// };

// module.exports.getCaptainsInTheRadius = async (lat, lng, radius, vehicleType) => {
//   console.log(lat, lng, radius, vehicleType);
//   try {
//     const captains = await captainModel.find({
//       location: {
//         $geoWithin: {
//           $centerSphere: [[lng, lat], radius / 6371], // Correct order: [lng, lat]
//         },
//       },
//       "vehicle.type": vehicleType,
//     });
//     return captains;
//   } catch (error) {
//     console.error("Error in getCaptainsInTheRadius:", error.message);
//     throw new Error("Error getting captains in radius");
//   }
// };

module.exports.getCaptainsInTheRadius = async (lat, lng, radius, vehicleType) => {
  console.log(lat, lng, radius, vehicleType);
  try {
    const captains = await captainModel.find({
      "vehicle.type": vehicleType,
    });
    console.log(captains);
    return captains;
  } catch (error) {
    console.error("Error in getCaptainsInTheRadius:", error.message);
    throw new Error("Error getting captains in radius");
  }
};
