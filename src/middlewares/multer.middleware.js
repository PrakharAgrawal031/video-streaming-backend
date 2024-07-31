import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(path.dirname(file.originalname), "..", "public", "temp"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname);
//   },
// });

// export const upload = multer({ storage });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname)
  }
})

export const upload = multer({storage})
  
//   export const upload = multer({ storage, })