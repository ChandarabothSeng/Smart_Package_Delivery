const mongoose = require("mongoose");

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

module.exports = mongoose.model("Package", packageSchema);