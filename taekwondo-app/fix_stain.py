import cv2
import numpy as np
import shutil

# Restore from backup first to start fresh
shutil.copy('/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent_backup.png', '/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent.png')

img = cv2.imread('/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent.png', cv2.IMREAD_UNCHANGED)

# Define the region of interest where the stain is
roi = img[530:630, 360:460]

# Find dark pixels
gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGRA2GRAY)
mask = cv2.inRange(gray_roi, 0, 80) # increased threshold to catch grey edges

# Also check alpha to only target non-transparent pixels
alpha_roi = roi[:, :, 3]
mask = cv2.bitwise_and(mask, alpha_roi)

# Dilate the mask slightly to cover the edges of the black stain
kernel = np.ones((3,3), np.uint8)
mask_dilated = cv2.dilate(mask, kernel, iterations=1)

# Get the average color of the surrounding fur (non-mask pixels in ROI that are opaque)
surrounding_mask = cv2.bitwise_and(cv2.bitwise_not(mask_dilated), alpha_roi)
surrounding_pixels = roi[surrounding_mask > 0]
if len(surrounding_pixels) > 0:
    avg_color = np.mean(surrounding_pixels, axis=0)
else:
    avg_color = [240, 240, 240, 255]

# Fill the stain with the average surrounding color
roi[mask_dilated > 0] = avg_color

# Smooth the filled area
roi_blurred = cv2.GaussianBlur(roi, (7,7), 0)

# Blend the blurred ROI back into the original only where the mask is
for c in range(4):
    roi[:, :, c] = np.where(mask_dilated > 0, roi_blurred[:, :, c], roi[:, :, c])

# Make sure it's fully opaque where we filled it
roi[mask_dilated > 0, 3] = 255

img[530:630, 360:460] = roi

cv2.imwrite('/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent.png', img)
print("Stain filled with solid fur color.")
