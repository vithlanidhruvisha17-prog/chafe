const path = require('path');
const crypto = require('crypto');
const { getSupabase } = require('../config/supabase');

const getBucketName = () => process.env.SUPABASE_BUCKET_NAME || 'arabista-images';

/**
 * Uploads a memory file buffer to Supabase Storage and returns the public URL
 * @param {Express.Multer.File} file - Multer in-memory file object
 * @param {string} folder - Folder prefix in the bucket (e.g. 'menu', 'banners', 'gallery')
 * @returns {Promise<{ url: string, path: string, filename: string }>}
 */
const uploadImage = async (file, folder = 'uploads') => {
  if (!file || !file.buffer) {
    const err = new Error('No image file provided for upload.');
    err.statusCode = 400;
    throw err;
  }

  const supabase = getSupabase();
  const bucket = getBucketName();

  const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
  const uniqueId = crypto.randomUUID();
  const sanitizedFolder = folder.replace(/^\/+|\/+$/g, '');
  const filePath = `${sanitizedFolder}/${Date.now()}-${uniqueId}${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    const err = new Error(`Image upload failed: ${uploadError.message}`);
    err.statusCode = 502;
    throw err;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    url: publicUrlData.publicUrl,
    path: filePath,
    filename: path.basename(filePath),
  };
};

/**
 * Deletes an image from Supabase Storage by bucket path or full public URL
 * @param {string} pathOrUrl - Storage path (e.g. 'menu/img.jpg') or full Supabase URL
 * @returns {Promise<{ success: boolean }>}
 */
const deleteImage = async (pathOrUrl) => {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') {
    const err = new Error('A valid file path or public URL is required to delete an image.');
    err.statusCode = 400;
    throw err;
  }

  const supabase = getSupabase();
  const bucket = getBucketName();

  let storagePath = pathOrUrl.trim();
  const publicMarker = `/storage/v1/object/public/${bucket}/`;

  if (storagePath.includes(publicMarker)) {
    storagePath = storagePath.split(publicMarker)[1];
  } else if (storagePath.startsWith('http')) {
    const markerWithBucket = `/${bucket}/`;
    const parts = storagePath.split(markerWithBucket);
    if (parts.length > 1) {
      storagePath = parts.slice(1).join(markerWithBucket);
    }
  }

  const { error: deleteError } = await supabase.storage
    .from(bucket)
    .remove([storagePath]);

  if (deleteError) {
    const err = new Error(`Image deletion failed: ${deleteError.message}`);
    err.statusCode = 502;
    throw err;
  }

  return { success: true };
};

module.exports = {
  uploadImage,
  deleteImage,
};
