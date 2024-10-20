import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `C:/Projects/WEB/ChatApp/uploads`);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now(); 
        cb(null, `${uniqueSuffix}-thumbnail${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits:{fileSize: 80000000}, //80MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
    }
}).single('image');

export default upload;


