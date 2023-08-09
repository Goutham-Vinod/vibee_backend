import multer from "multer"
import path from "path"

const maxSize = 50 * 1024 * 1024

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/posts")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + file.originalname)
  },
})

const upload = multer({
  
  storage,
  limits: { fileSize: maxSize },
  fileFilter: (req, file, cb) => {
    console.log('inside multer file filter');
    const filetypes = /jpeg|jpg|png|webp|mp4|avi|mov|flv|wmv/
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    )
    


    const mimetype = filetypes.test(file.mimetype)
    
    if (mimetype && extname) {
      console.log('Inside multer if case');
      return cb(null, true)
    } else {
      console.log('Error inside multer else bloc');
      return cb(null, false)
    }
  },
})

export default upload
