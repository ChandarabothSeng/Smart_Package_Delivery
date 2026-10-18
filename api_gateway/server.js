const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const app = express();
app.use(express.json());

// Configuration
const JWT_SECRET = "smart_delivery_key";

const REGISTRATION_SERVICE =
  "http://registration_service:4001";

const LOGIN_SERVICE =
  "http://login_service:4002";

const PACKAGE_SERVICE =
  "http://package_service:4003";

const DELIVERY_SERVICE =
  "http://delivery_service:4004";

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // No token
  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided."
    });
  }

  // Expected:
  // Authorization: Bearer TOKEN
  const token = authHeader.split(" ")[1];

  // Invalid format
  if (!token) {
    return res.status(401).json({
      message: "Access denied. Invalid authorization format."
    });
  }

  // Verify token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        message: "Invalid or expired token."
      });
    }
    // Save decoded JWT information
    req.user = user;
    next();
  });
}

// Role Authorization Middleware
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (
      !req.user ||
      !allowedRoles.includes(req.user.role)
    ) {
      return res.status(403).json({
        message:
          "Unauthorized. You do not have permission to access this resource."
      });
    }
    next();
  };
}

// Helper Function
// Forward Request to Microservice
async function forwardRequest(
  serviceUrl,
  req,
  res
) {
  try {
    const response = await axios({
      method: req.method,
      url:
        serviceUrl +
        req.originalUrl,
      data: req.body,
      headers: {
        "Content-Type": "application/json",
        // Forward JWT to the microservice
        authorization:
          req.headers.authorization
      }
    });
    res.status(response.status).json(
      response.data
    );

  } catch (error) {
    console.error(
      "Gateway forwarding error:",
      error.message
    );
    if (error.response) {
      return res
        .status(error.response.status)
        .json(error.response.data);
    }
    res.status(500).json({
      message:
        "Unable to connect to microservice.",
      error: error.message
    });
  }
}

// REGISTRATION SERVICE
// Public
app.post(
  "/register",
  async (req, res) => {
    await forwardRequest(
      REGISTRATION_SERVICE,
      req,
      res
    );
  }
);

// LOGIN SERVICE
// Public
app.post(
  "/login",
  async (req, res) => {
    await forwardRequest(
      LOGIN_SERVICE,
      req,
      res
    );
  }
);

// PACKAGE SERVICE
// Customer APIs

// Create package
app.post(
  "/packages",
  authenticateToken,
  authorizeRoles("customer"),
  async (req, res) => {
    await forwardRequest(
      PACKAGE_SERVICE,
      req,
      res
    );
  }
);

// Get customer's packages
app.get(
  "/packages/customer/:customerId",
  authenticateToken,
  authorizeRoles("customer"),
  async (req, res) => {
    await forwardRequest(
      PACKAGE_SERVICE,
      req,
      res
    );
  }
);

// Get package by ID
app.get(
  "/packages/:id",
  authenticateToken,
  authorizeRoles("customer"),
  async (req, res) => {
    await forwardRequest(
      PACKAGE_SERVICE,
      req,
      res
    );
  }
);

// PACKAGE SERVICE
// Delivery Staff API

// Update package status
app.put(
  "/packages/:id/status",
  authenticateToken,
  authorizeRoles("delivery_staff"),
  async (req, res) => {
    await forwardRequest(
      PACKAGE_SERVICE,
      req,
      res
    );
  }
);

// DELIVERY SERVICE
// Delivery Staff APIs

// Assign delivery
app.post(
  "/deliveries",
  authenticateToken,
  authorizeRoles("delivery_staff"),
  async (req, res) => {
    await forwardRequest(
      DELIVERY_SERVICE,
      req,
      res
    );
  }
);

// Get staff deliveries
app.get(
  "/deliveries/staff/:staffId",
  authenticateToken,
  authorizeRoles("delivery_staff"),
  async (req, res) => {
    await forwardRequest(
      DELIVERY_SERVICE,
      req,
      res
    );
  }
);

// Get delivery by ID
app.get(
  "/deliveries/:id",
  authenticateToken,
  authorizeRoles("delivery_staff"),
  async (req, res) => {
    await forwardRequest(
      DELIVERY_SERVICE,
      req,
      res
    );
  }
);

// Update delivery status
app.put(
  "/deliveries/:id/status",
  authenticateToken,
  authorizeRoles("delivery_staff"),
  async (req, res) => {
    await forwardRequest(
      DELIVERY_SERVICE,
      req,
      res
    );

  }
);

// TEST ENDPOINT
// Customer
app.get(
  "/customer-test",
  authenticateToken,
  authorizeRoles("customer"),
  (req, res) => {
    res.status(200).json({
      message: "Customer access granted",
      user: req.user
    });
  }
);

// TEST ENDPOINT
// Delivery Staff
app.get(
  "/delivery-test",
  authenticateToken,
  authorizeRoles("delivery_staff"),
  (req, res) => {
    res.status(200).json({
      message:
        "Delivery Staff access granted",
      user: req.user
    });
  }
);

// Start API Gateway
const PORT = 4000;
app.listen(PORT, () => {
  console.log(
    `API Gateway running on port ${PORT}`
  );
});