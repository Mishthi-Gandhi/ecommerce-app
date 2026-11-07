const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { UPLOAD_DIR } = require("../utils/files");

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // random file name: avoids spaces/special characters and name clashes
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"), false);
}

module.exports = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
