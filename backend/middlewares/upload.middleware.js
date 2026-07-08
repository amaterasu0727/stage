const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const EXTENSIONS_AUTORISEES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg', '.mp4'];

const stockage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/tickets'),
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const filtreFichier = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  if (!EXTENSIONS_AUTORISEES.includes(extension)) {
    return cb(new Error('FORMAT_NON_AUTORISE'));
  }
  cb(null, true);
};

const upload = multer({
  storage: stockage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: filtreFichier,
});

module.exports = upload;