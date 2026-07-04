import cv2
import numpy as np
import shutil

# Restore original image and transparent image
# We will create a fresh transparent image and carefully remove the stain

img = cv2.imread('/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent_backup.png', cv2.IMREAD_UNCHANGED)

# Let's find the hole. The hole is where alpha is 0, but it shouldn't be.
# Wait, the backup image HAS the black stain. The user said "noda hitam masih ada karena transparan".
# Ah! The user is seeing the black stain as transparent? No, "noda hitam dibawah mata maskot masih ada, karena transparan".
# This means my previous fix DID NOT WORK, the black stain is STILL THERE. And because it's black, maybe it looks like a hole?
# Or maybe the background glow makes the black stain look like a hole?
# In the screenshot provided by the user, the left cheek has a yellow/gold shape.
# This means the alpha channel in that area is 0 (transparent), so the yellow background from the UI shines through.
# Let's fix the alpha channel. We can take the alpha channel, and fill any holes in it.

alpha = img[:, :, 3]

# Create a mask of the transparent pixels (alpha == 0)
transparent_mask = (alpha == 0).astype(np.uint8) * 255

# The hole is roughly on the left side of the face.
# Let's just draw a filled white polygon over the left cheek to force it to be opaque.
# We will also set the color of these pixels to a light gray/white so it matches the fur.

# Coordinates for the left cheek (viewer's left):
# x roughly from 250 to 450
# y roughly from 450 to 650

# We will just force a block of the alpha channel to be 255, and color it white.
# But we don't want to draw outside the face.
# Let's find the outer contour of the face.
contours, _ = cv2.findContours((alpha > 0).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
if contours:
    face_contour = max(contours, key=cv2.contourArea)
    face_mask = np.zeros_like(alpha)
    cv2.drawContours(face_mask, [face_contour], -1, 255, -1)
    
    # Now we have a solid mask of the face (no holes).
    # The holes are where face_mask is 255 but alpha is 0.
    holes = cv2.bitwise_and(face_mask, cv2.bitwise_not(alpha))
    
    # Fill these holes in the original image with opaque white/gray
    img[holes > 0] = [230, 230, 230, 255] # BGR + Alpha

cv2.imwrite('/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent.png', img)
print("Holes filled successfully.")
