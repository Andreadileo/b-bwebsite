
import cv2
import numpy as np
import os

# Leggi l'immagine
image_path = 'img/collage_attrazioni.jpg'
img = cv2.imread(image_path)
if img is None:
    print("Errore: Immagine non trovata")
    exit(1)

# Converti in scala di grigi
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Applica un threshold per trovare le aree scure/chiare
# L'immagine ha sfondo bianco/chiaro?
# Usiamo un threshold adattivo o Canny per i bordi
_, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

# Dilatazione per unire eventuali buchi nei contorni
kernel = np.ones((5,5),np.uint8)
dilated = cv2.dilate(thresh, kernel, iterations=2)

# Trova contorni
contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

# Ordina contorni (dall'alto in basso, poi da sinistra a destra)
def sort_contours(cnts):
    reverse = False
    i = 1 # y-coordinate
    boundingBoxes = [cv2.boundingRect(c) for c in cnts]
    (cnts, boundingBoxes) = zip(*sorted(zip(cnts, boundingBoxes),
                                        key=lambda b: b[1][i], reverse=reverse))
    return cnts

if len(contours) > 0:
    contours = sort_contours(contours)

saved_count = 0
min_area = 5000 # Filtro per ignorare rumore
header_aspect_ratio_threshold = 4.0 # Ignora le barre orizzontali larghe (i titoli)

print(f"Trovati {len(contours)} potenziali contorni.")

for i, c in enumerate(contours):
    x, y, w, h = cv2.boundingRect(c)
    area = w * h
    aspect_ratio = w / float(h)
    
    # Filtra: deve essere abbastanza grande e non una striscia orizzontale (header)
    if area > min_area and aspect_ratio < header_aspect_ratio_threshold:
        # Ritaglia
        roi = img[y:y+h, x:x+w]
        
        # Salva
        filename = f"img/crop_{saved_count}.jpg"
        cv2.imwrite(filename, roi)
        print(f"Salvato {filename} (w={w}, h={h}, ar={aspect_ratio:.2f})")
        saved_count += 1

print(f"Totale immagini salvate: {saved_count}")
