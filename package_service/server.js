require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Package Schema
const packageSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    receiverName: {
      type: String,
      required: true
    },

    receiverPhone: {
      type: String,
      required: true
    },

    pickupAddress: {
      type: String,
      required: true
    },

    deliveryAddress: {
      type: String,
      required: true
    },

    packageType: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED"
      ],
      default: "PENDING"
    }
  },
  {
    timestamps: true
  }
);

const Package = mongoose.model("Package", packageSchema);

// API 1: Create Package
app.post("/packages", async (req, res) => {
  try {
    const {
      customerId,
      receiverName,
      receiverPhone,
      pickupAddress,
      deliveryAddress,
      packageType
    } = req.body;

    if (
      !customerId ||
      !receiverName ||
      !receiverPhone ||
      !pickupAddress ||
      !deliveryAddress ||
      !packageType
    ) {
      return res.status(400).json({
        message: "All package information is required."
      });
    }

    const newPackage = new Package({
      customerId,
      receiverName,
      receiverPhone,
      pickupAddress,
      deliveryAddress,
      packageType
    });

    const savedPackage = await newPackage.save();

    res.status(201).json({
      message: "Package created successfully",
      package: savedPackage
    });
  } catch (error) {
    console.error("Create package error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// API 2: Get Customer Packages
app.get("/packages/customer/:customerId", async (req, res) => {
  try {
    const packages = await Package.find({
      customerId: req.params.customerId
    });

    res.status(200).json({
      message: "Packages retrieved successfully",
      packages: packages
    });
  } catch (error) {
    console.error("Get packages error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// API 3: Get Package by ID
app.get("/packages/:id", async (req, res) => {
  try {
    const packageData = await Package.findById(req.params.id);

    if (!packageData) {
      return res.status(404).json({
        message: "Package not found"
      });
    }

    res.status(200).json({
      message: "Package retrieved successfully",
      package: packageData
    });
  } catch (error) {
    console.error("Get package error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// API 4: Update Package Status
app.put("/packages/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "ASSIGNED",
      "PICKED_UP",
      "IN_TRANSIT",
      "DELIVERED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid package status."
      });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({
        message: "Package not found"
      });
    }

    res.status(200).json({
      message: "Package status updated successfully",
      package: updatedPackage
    });
  } catch (error) {
    console.error("Update package status error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// Start Package Service
const PORT = 4003;

app.listen(PORT, () => {
  console.log(`Package Service running on port ${PORT}`);
});