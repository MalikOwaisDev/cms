const multer = require("multer");

// Define the allowed MIME types
const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

// The fileFilter function
const fileFilter = (req, file, cb) => {
  // Check if the incoming file's mime type is in our allowed list
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // If it is, accept the file
    cb(null, true);
  } else {
    // If it's not an allowed type, reject the file with a custom error
    cb(
      new Error(
        "Invalid file type. Only PNG, JPG, JPEG, and WEBP are allowed."
      ),
      false
    );
  }
};

const storage = multer.memoryStorage();

// The complete multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  // NEW: Add the limits object
  limits: {
    // Set the file size limit to 10MB (10 * 1024 * 1024 bytes)
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;
