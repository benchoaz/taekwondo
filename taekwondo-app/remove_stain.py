import cv2
import numpy as np

img = cv2.imread('/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent.png', cv2.IMREAD_UNCHANGED)

# Define the region of interest where the stain is
# Left side of face, below eye (y > 530), above mouth (y < 630), x between 360 and 460
roi = img[530:630, 360:460]

# Find dark pixels
gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGRA2GRAY)
mask = cv2.inRange(gray_roi, 0, 50)

# Also check alpha to only target non-transparent pixels
alpha_roi = roi[:, :, 3]
mask = cv2.bitwise_and(mask, alpha_roi)

# Instead of making it transparent (which might look like a hole),
# let's inpaint it using the surrounding colors
# First, create a full image mask
full_mask = np.zeros(img.shape[:2], dtype=np.uint8)
full_mask[530:630, 360:460] = mask

# Dilate the mask slightly to cover edges
kernel = np.ones((5,5), np.uint8)
full_mask = cv2.dilate(full_mask, kernel, iterations=1)

# Inpaint
img_rgb = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
inpainted_rgb = cv2.inpaint(img_rgb, full_mask, 3, cv2.INPAINT_TELEA)

# Add alpha channel back
inpainted_bgra = cv2.cvtColor(inpainted_rgb, cv2.COLOR_BGR2BGRA)
inpainted_bgra[:, :, 3] = img[:, :, 3]

# If there were any fully transparent pixels that got inpainted, make them transparent again
inpainted_bgra[img[:,:,3] == 0] = [0, 0, 0, 0]

cv2.imwrite('/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent.png', inpainted_bgra)
print("Stain removed and saved.")
