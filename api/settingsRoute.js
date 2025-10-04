// Backend/routes/settingsRoute.js
import express from "express";
import Settings from "../models/settingsModel.js";
import adminAuth from "../middleware/adminAuth.js"; // use your adminAuth middleware

const settingsRouter = express.Router();

// GET settings (any logged-in admin)
settingsRouter.get("/", adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        general: {
          brandName: "My Brand",
          contactEmail: "",
          contactPhone: "",
          socialLinks: {},
        },
        store: {
          currency: "USD",
        },
        users: [],
        integrations: {
          stripe: { apiKey: "" },
        },
      });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE settings
settingsRouter.put("/", adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      // Merge incoming updates with existing settings
      settings.general = { ...settings.general, ...req.body.general };
      settings.store = { ...settings.store, ...req.body.store };
      settings.users = req.body.users || settings.users;
      settings.integrations = { ...settings.integrations, ...req.body.integrations };
    }
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default settingsRouter;
