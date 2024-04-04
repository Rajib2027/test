import express from 'express';
import {  test , getUserListings, addToFavorites, getAllFavorites, sendOtp, submitOtp, favourites, sendEmail, sendEnquiry, verifyOtp, userOtp, updateUser, allVisitors, addReferals, getDoc,  getRefs, getIndRef, changeRefStatus} from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';
import multer from 'multer';


const router = express.Router();

router.get('/test', test);
router.post('/sendOtp', sendOtp);
router.post('/userOtp', userOtp);
router.post('/send-email', sendEmail);
router.post('/send-enquiry', sendEnquiry);
router.post('/submitOtp', submitOtp);

router.post('/verifyOtp',verifyOtp)
router.post('/update/:id',verifyToken,updateUser)


router.get('/fav/:userId', favourites);
// router.post('/update/:id', verifyToken, updateUser)
// router.delete('/delete/:id', verifyToken, deleteUser)
router.get('/listings/:id', verifyToken, getUserListings)
router.post('/add',verifyToken, addToFavorites);
router.get('/all/:userId', getAllFavorites);
//router.get('/:id', verifyToken, getUser)
router.get('/allVisitor',allVisitors)

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads'); // Define the destination folder for uploads
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + '-' + file.originalname); // Define the filename
//     },
//   });
  
//   const upload = multer({ storage });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/addRefs', upload.fields([{ name: 'pan', maxCount: 1 }, { name: 'aadhar', maxCount: 1 }]), addReferals);
  
  router.get('/referals',getDoc)
  router.get('/getRef/:userId', getRefs)

   router.get('/indRef/:id',getIndRef)

   router.put('/referrals/:id', changeRefStatus);
export default router;