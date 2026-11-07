const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "..", "public", "uploads");

// Delete an uploaded image from disk. Only files inside public/uploads can be removed.
function deleteUploadedFile(urlPath) {
  if (!urlPath || !urlPath.startsWith("/uploads/")) return;
  const filePath = path.join(UPLOAD_DIR, path.basename(urlPath));
  fs.unlink(filePath, () => {});
}

module.exports = { deleteUploadedFile, UPLOAD_DIR };
