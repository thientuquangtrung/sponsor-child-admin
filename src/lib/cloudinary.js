import { BASE_URL } from '@/config/app';
import { Cloudinary } from '@cloudinary/url-gen';

const UPLOAD_PRESET_NAME = import.meta.env.VITE_UPLOAD_PRESET_NAME;
const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_APIKEY;
const CLOUDINARY_SECRET = import.meta.env.VITE_CLOUDINARY_SECRET;

const UPLOAD_FOLDER = {
    getUserProfileFolder: (userID) => `users/${userID}`,
    getUserIdentificationDocFolder: (userID) => `users/${userID}/identification_docs`,
    getUserExperienceFolder: (userID) => `users/${userID}/experiences`,
    getGuaranteeContractFolder: (userID) => `users/${userID}/contracts`,
};

const UPLOAD_NAME = {
    PROFILE_PICTURE: 'profile_picture',
    CCCD_FRONT: 'cccd_front',
    CCCD_BACK: 'cccd_back',
    SIGNATURE_GUARANTEE: 'signature_guarantee',
    REGISTRATION_CONTRACT_SOFT: 'registration_contract_soft',
    REGISTRATION_CONTRACT_HARD: 'registration_contract_hard',
};

// Create a Cloudinary instance and set your cloud name.
const cld = new Cloudinary({
    cloud: {
        cloudName: CLOUD_NAME,
        apiKey: CLOUDINARY_API_KEY,
        apiSecret: CLOUDINARY_SECRET,
    },
});

/**
 * Fetches signature and timestamp from the server for Cloudinary operations
 * @param {Object} searchParams - Parameters to include in signature generation
 * @returns {Promise<{signature: string, timestamp: number}>} Object containing signature and timestamp
 * @throws {Error} If signature fetch fails
 */
async function getSignatureAndTimestamp({ ...searchParams }) {
    try {
        const response = await fetch(`${BASE_URL}/FileManagement/signature?${new URLSearchParams(searchParams)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to get signature and timestamp:', error);
        throw error;
    }
}

/**
 * Uploads a file to Cloudinary
 * @param {Object} params - Upload parameters
 * @param {File} params.file - The file to upload
 * @param {string} [params.folder=''] - Cloudinary folder path
 * @param {string} [params.resourceType='image'] - Resource type ('image', 'video', 'raw', etc.)
 * @param {string} [params.customFilename=null] - Custom public_id for the uploaded file
 * @returns {Promise<Object>} Cloudinary upload response
 * @throws {Error} If upload fails
 */
async function uploadFile({ file, folder = '', tags = '', resourceType = 'image', customFilename = null }) {
    try {
        const { signature, timestamp } = await getSignatureAndTimestamp({
            folder,
            tags,
            public_id: customFilename,
            upload_preset: UPLOAD_PRESET_NAME,
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET_NAME);
        formData.append('api_key', CLOUDINARY_API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);

        if (folder) {
            formData.append('folder', folder);
        }

        if (tags) {
            formData.append('tags', tags);
        }

        if (customFilename) {
            formData.append('public_id', customFilename);
        }

        // Upload the new file
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
            method: 'POST',
            body: formData,
        });

        return await response.json();
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
}

/**
 * Upload multiple files to Cloudinary
 * @param {Object} params - Upload parameters
 * @param {Array} params.files - Array of files to upload
 * @param {string} [params.folder=''] - Cloudinary folder path
 */
async function uploadMultipleFiles({ files, folder = '' }) {
    const tags = folder.replaceAll('/', '_');
    const uploadPromises = files.map((file, index) =>
        uploadFile({ file, folder, tags, resourceType: file.type.split('/')[0], customFilename: index.toString() }),
    );
    return await Promise.all(uploadPromises);
}

/**
 * Retrieves a list of assets within a folder
 * @param {string} tags - Tag to filter assets
 * @param {string} [resourceType='any'] - Resource type to filter
 * @returns {Promise<Array>} Array of matching resources
 * @throws {Error} If asset retrieval fails
 */
async function getAssetsList(tags, resourceType = 'any') {
    const url = `https://res.cloudinary.com/${import.meta.env.VITE_CLOUD_NAME}/${resourceType}/list/${tags}.json`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.resources;
    } catch (error) {
        console.error('Failed to retrieve assets:', error);
        throw error;
    }
}

/**
 * Generates a Cloudinary URL with specified transformations
 * @param {string} publicId - Public ID of the asset
 * @param {Array} [transformations=[]] - Array of transformation objects
 * @param {string} [resourceType='image'] - Type of resource
 * @returns {string} Transformed Cloudinary URL
 */
function getUrlWithTransformations(publicId, transformations = [], resourceType = 'image') {
    return cld.image(publicId).setDeliveryType(resourceType).setTransformation(transformations).toURL();
}

/**
 * Generates a URL for a resized version of an image
 * @param {string} publicId - Public ID of the image
 * @param {number} width - Desired width in pixels
 * @param {number} height - Desired height in pixels
 * @returns {string} URL for the resized image
 */
function resizeAsset(publicId, width, height) {
    return getUrlWithTransformations(publicId, [
        {
            width: width,
            height: height,
            crop: 'fill',
        },
    ]);
}

/**
 * Generates a secure URL for an asset
 * @param {string} publicId - Public ID of the asset
 * @param {string} [resourceType='image'] - Type of resource
 * @returns {string} Secure Cloudinary URL
 */
function getSecureUrl(publicId, resourceType = 'image') {
    return cld.image(publicId).setDeliveryType(resourceType).toURL();
}

/**
 * Deletes an asset from Cloudinary
 * @param {Object} params - Delete parameters
 * @param {string} params.publicId - Public ID of the asset to delete
 * @param {string} [params.resourceType='image'] - Type of resource to delete
 * @returns {Promise<Object>} Cloudinary deletion response
 * @throws {Error} If deletion fails
 */
async function deleteAsset({ publicId, resourceType = 'image' }) {
    try {
        // Get signature and timestamp using existing function
        const { signature, timestamp } = await getSignatureAndTimestamp({
            public_id: publicId,
        });

        const formData = new FormData();
        formData.append('public_id', publicId);
        formData.append('api_key', CLOUDINARY_API_KEY);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('resource_type', resourceType);

        // Use signature to delete from Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/destroy`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Delete failed:', error);
        throw error;
    }
}

export {
    uploadFile,
    uploadMultipleFiles,
    getAssetsList,
    getUrlWithTransformations,
    resizeAsset,
    getSecureUrl,
    deleteAsset,
    UPLOAD_FOLDER,
    UPLOAD_NAME,
};
