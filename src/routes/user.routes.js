import { Router } from "express";
import {registerUser,
    logoutUser,
    loginUser,
    refreshAccessToken,
    changeUserPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvtar,
    updateCoverimage,
    getUserProfile,
    getWatchHistory} from '../controllers/user.controller.js'
import { upload } from '../middlewares/multer.middleware.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';
const router = Router();

router.route('/register').post(
    upload.fields([
        { name: 'avtar', maxCount: 1 },
        { name: 'coverimage', maxCount: 1 }
    ]),
    registerUser
);

router.route('/login').post(loginUser)
router.route('/profile').get(getUserProfile)
//secured routes
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refreshAccessToken)


export default router;