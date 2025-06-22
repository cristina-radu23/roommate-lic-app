-- Add order column to photos table
ALTER TABLE photos ADD COLUMN `order` INT DEFAULT 0;

-- Update existing photos to have order based on creation time
UPDATE photos SET `order` = (
  SELECT position FROM (
    SELECT photoId, ROW_NUMBER() OVER (PARTITION BY listingId ORDER BY createdAt ASC) - 1 as position
    FROM photos
  ) AS ordered_photos 
  WHERE ordered_photos.photoId = photos.photoId
); 