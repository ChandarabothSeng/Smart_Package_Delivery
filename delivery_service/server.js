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

// Delivery Schema
const deliverySchema = new mongoose.Schema(
  {
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    deliveryStaffId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    status: {
      type: String,
      enum: [
        "ASSIGNED",
        "PICKED_UP",
        "IN_TRANSIT",
        "DELIVERED"
      ],
      default: "ASSIGNED"
    },

    assignedAt: {
      type: Date,
      default: Date.now
    },

    deliveredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Delivery = mongoose.model("Delivery", deliverySchema);

// API 1: Create Delivery
app.post("/deliveries", async (req, res) => {
  try {
    const {
      packageId,
      deliveryStaffId
    } = req.body;

    if (!packageId || !deliveryStaffId) {
      return res.status(400).json({
        message: "Package ID and Delivery Staff ID are required."
      });
    }

    const newDelivery = new Delivery({
      packageId,
      deliveryStaffId
    });

    const savedDelivery = await newDelivery.save();

    res.status(201).json({
      message: "Delivery assigned successfully",
      delivery: savedDelivery
    });
  } catch (error) {
    console.error("Create delivery error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// API 2: Get Staff Deliveries
app.get("/deliveries/staff/:staffId", async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      deliveryStaffId: req.params.staffId
    });

    res.status(200).json({
      message: "Staff deliveries retrieved successfully",
      deliveries: deliveries
    });
  } catch (error) {
    console.error("Get staff deliveries error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// API 3: Get Delivery by ID
app.get("/deliveries/:id", async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        message: "Delivery not found"
      });
    }

    res.status(200).json({
      message: "Delivery retrieved successfully",
      delivery: delivery
    });
  } catch (error) {
    console.error("Get delivery error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// API 4: Update Delivery Status
app.put("/deliveries/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "ASSIGNED",
      "PICKED_UP",
      "IN_TRANSIT",
      "DELIVERED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid delivery status."
      });
    }

    const updateData = {
      status: status
    };

    if (status === "DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    const updatedDelivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedDelivery) {
      return res.status(404).json({
        message: "Delivery not found"
      });
    }

    res.status(200).json({
      message: "Delivery status updated successfully",
      delivery: updatedDelivery
    });
  } catch (error) {
    console.error("Update delivery status error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

// Start Delivery Service
const PORT = 4004;

app.listen(PORT, () => {
  console.log(`Delivery Service running on port ${PORT}`);
});