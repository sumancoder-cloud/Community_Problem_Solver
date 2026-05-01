import {Router} from 'express'
import upload from '../middleware/uploadMiddleware.js'
import { uploadImage } from '../controllers/imageUploadController.js'

const router = Router()

router.post('/upload',upload.single('image'), uploadImage)

export default router