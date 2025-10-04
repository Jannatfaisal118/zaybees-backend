import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  general: {
    brandName: { type: String, default: "" },
    logo: { type: String, default: "" },
    favicon: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    socialLinks: { type: Map, of: String, default: {} }, // e.g., { facebook: "url", twitter: "url" }
  },
  store: {
    currency: { type: String, default: "USD" },
    languages: { type: [String], default: ["en"] },
    shippingZones: { type: [Object], default: [] },
    taxRates: { type: [Object], default: [] },
  },
  users: [
    {
      name: String,
      email: String,
      role: { type: String, enum: ["Admin", "Editor", "Viewer"], default: "Viewer" },
    },
  ],
  integrations: {
    stripe: { enabled: { type: Boolean, default: false }, apiKey: { type: String, default: "" } },
    paypal: { enabled: { type: Boolean, default: false }, apiKey: { type: String, default: "" } },
    analytics: { enabled: { type: Boolean, default: false }, apiKey: { type: String, default: "" } },
    emailMarketing: { enabled: { type: Boolean, default: false }, apiKey: { type: String, default: "" } },
  },
}, { timestamps: true });

export default mongoose.model("Settings", settingsSchema);
