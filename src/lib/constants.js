// Gojo's Bistro Constants

export const VENUE_INFO = {
  name: "Gojo's Bistro",
  shortName: "Gojo's Bistro",
  location: "Prenza, Balamban, Cebu",
  address: "Prenza, Balamban, Cebu, Philippines",
  tagline: "Food & Drinks Hub · Open Daily",
  courtCount: 3,
  courts: [
    { id: "court-1", name: "Court 1", is_active: true, netColor: "black" },
    { id: "court-2", name: "Court 2", is_active: true, netColor: "black" },
    { id: "court-3", name: "Court 3", is_active: true, netColor: "black" }
  ],
  contact: {
    email: "contact@gojosbistro.com",
    phone: "09179710229 / 09459662613",
    facebook: "https://www.facebook.com/",
    facebookMessage: "https://m.me/",
    googleMapsLink: "https://maps.app.goo.gl/o7e4ERDByXQ2r2oH9",
    wazeLink: "https://waze.com/"
  }
};

export const PRICING = {
  // Base hourly rates per court
  courtRates: {
    0: 600, 1: 600, 2: 600, 3: 600, 4: 600, 5: 600, 6: 600,
    7: 600, 8: 600, 9: 600, 10: 600, 11: 600, 12: 600,
    13: 600, 14: 600, 15: 600, 16: 600, 17: 600, 18: 600,
    19: 600, 20: 600, 21: 600, 22: 600, 23: 600
  },

  // Mon-Thurs Promo slot details:
  // Mon-Thurs, 6 AM - 12 NN, rate is ₱300 per person/head for the slot or ₱300/hr per court.
  promoRatePerHour: 300,

  // Extras
  paddleRate: 100,
  ballRate: 100,
  trainerHourlyRatePerPax: 500
};
