import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react'
import { uploadFile, deleteFile, generateFileName, STORAGE_BUCKETS, supabase } from '../lib/supabase'

const ImageUpload = ({ 
  bucket = STORAGE_BUCKETS.PRODUCT_IMAGES,
  currentImage = null,
  onImageChange,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  className = '',
  placeholder = 'Click to upload image'
}) => {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentImage)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return
    }

    setError('')
    setUploading(true)

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      // Generate unique filename
      const fileName = generateFileName(file.name, 'img-')
      const filePath = `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${fileName}`

      // Use direct Supabase upload with permissive policies
      let result
      try {
        const { data, error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true // Allow overwriting existing files
          })
        
        if (uploadError) {
          console.error('Upload error details:', uploadError)
          throw new Error(`Upload failed: ${uploadError.message}`)
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)
        
        result = {
          success: true,
          data,
          publicUrl: urlData.publicUrl
        }
      } catch (error) {
        console.error('Direct upload failed:', error)
        throw error
      }

      if (result.success) {
        // Clean up preview URL
        URL.revokeObjectURL(previewUrl)
        
        // Set the actual uploaded image URL
        setPreview(result.publicUrl)
        
        // Notify parent component
        if (onImageChange) {
          onImageChange({
            url: result.publicUrl,
            path: filePath,
            fileName: fileName
          })
        }
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload image')
      setPreview(currentImage) // Reset to current image
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (preview && preview !== currentImage) {
      try {
        // Extract path from URL for deletion
        const url = new URL(preview)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(-3).join('/') // Get year/month/filename
        
        await deleteFile(bucket, filePath)
      } catch (err) {
        console.error('Delete error:', err)
      }
    }

    setPreview(null)
    setError('')
    
    if (onImageChange) {
      onImageChange(null)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`image-upload ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={uploading}
      />
      
      <div className="upload-area" onClick={handleClick}>
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" className="preview-image" />
            <div className="image-overlay">
              {uploading ? (
                <div className="upload-progress">
                  <Loader className="spinner" />
                  <span>Uploading...</span>
                </div>
              ) : (
                <div className="image-actions">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClick()
                    }}
                    className="action-btn change-btn"
                    title="Change image"
                  >
                    <Upload size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                    className="action-btn remove-btn"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            {uploading ? (
              <div className="upload-progress">
                <Loader className="spinner" />
                <span>Uploading...</span>
              </div>
            ) : (
              <>
                <ImageIcon className="upload-icon" />
                <span className="upload-text">{placeholder}</span>
                <span className="upload-hint">
                  Supports: JPG, PNG, GIF (max {Math.round(maxSize / 1024 / 1024)}MB)
                </span>
              </>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}
    </div>
  )
}

export default ImageUpload