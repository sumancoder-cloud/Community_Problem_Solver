import cloudinary from '../config/cloudinary.js'

export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" })
        }

        const result = await cloudinary.uploader.upload(req.file.path)

        res.status(200).json({
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
            imageId: result.public_id
        })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}