const mongoose = require("mongoose");

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

module.exports = mongoose.model("Delivery", deliverySchema);