export default {
  port: process.env.PORT || 4000,
  hashSalt: process.env.HASH_SALT || 12,
  jwtSecret: process.env.JWTSecret || "somethingsecret",
  jwtExpire: "24h",
};
