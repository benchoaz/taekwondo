import cv2
import numpy as np

img = cv2.imread('/home/beni/taekwondo/taekwondo-app/public/daily_quest_tiger_transparent.png', cv2.IMREAD_UNCHANGED)

# Let's search the whole image for large black blobs
gray = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
_, thresh = cv2.threshold(gray, 30, 255, cv2.THRESH_BINARY_INV)

# The alpha channel can act as a mask
alpha = img[:,:,3]
thresh = cv2.bitwise_and(thresh, alpha)

contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

blobs = []
for c in contours:
    area = cv2.contourArea(c)
    if area > 100:
        x, y, w, h = cv2.boundingRect(c)
        blobs.append((area, x, y, w, h))

blobs.sort(reverse=True)
for b in blobs:
    print(f"Area {b[0]} at x={b[1]}, y={b[2]}, w={b[3]}, h={b[4]}")

