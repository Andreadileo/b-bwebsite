
from PIL import Image, ImageOps 
import sys

def split_image():
    try:
        img_path = 'img/collage_inverno.jpg'
        img = Image.open(img_path)
        img = img.convert("RGB")
        width, height = img.size
        print(f"Dimensione immagine: {width}x{height}")

        # Converti in scala di grigi per l'analisi
        gray = img.convert("L")
        # Binarizza: tutto ciò che non è quasi bianco diventa nero, il resto bianco
        threshold = 240
        # Invertiamo: sfondo nero, oggetti bianchi per trovare i box
        bw = gray.point(lambda x: 0 if x > threshold else 255, '1')

        # Projettiamo sull'asse Y per trovare le righe
        # Somma i pixel bianchi per ogni riga
        # import numpy as np - RIMOSSO per evitare dipendenze mancanti
        # Se PIL c'è, numpy spesso c'è. Proviamo senza numpy per sicurezza estrema o usiamo un metodo semplice
        
        # Metodo semplice euristico: griglia fissa o quasi.
        # Dall'immagine vedo 3 colonne e 3 righe (l'ultima riga ha 3 img).
        # Ma ci sono i banner blu.
        
        # Facciamo una cosa più robusta: bounding box delle aree non bianche.
        # Possiamo trovare le componenti connesse o fare una scansione.
        
        # Scansione semplice a griglia "manuale" basata sui pixel
        # Cerchiamo le "isole" di contenuto.
        
        bboxes = []
        # bbox = (min_x, min_y, max_x, max_y)
        
        # Troviamo box ricorsivamente o iterativamente?
        # Usiamo ImageOps.invert per avere sfondo nero e oggetti colorati
        inverted = ImageOps.invert(img.convert("L"))
        # Getbbox trova il box di TUTTO il contenuto non nero.
        # Non utilissimo se è tutto unito.
        
        # Strategia "Fetta": Tagliamo dove ci sono righe interamente bianche (o quasi)
        # 1. Trova intervalli Y dove c'è contenuto
        row_has_content = []
        pixels = bw.load()
        for y in range(height):
            has_content = False
            for x in range(0, width, 5): # Campionamento ogni 5px per velocità
                if pixels[x, y] > 0: # Trovato pixel non bianco (cioè nero nel binarizzato invertito? no aspetta)
                    # bw: 0 se > threshold (bianco originale), 255 se <= threshold (scuro originale)
                    # Quindi cerchiamo 255
                    has_content = True
                    break
            row_has_content.append(has_content)
            
        # Trova segmenti Y
        y_ranges = []
        in_segment = False
        start_y = 0
        for y, has in enumerate(row_has_content):
            if has and not in_segment:
                start_y = y
                in_segment = True
            elif not has and in_segment:
                # Fine segmento (se alto almeno tot pixel)
                if y - start_y > 50: 
                    y_ranges.append((start_y, y))
                in_segment = False
        if in_segment and height - start_y > 50:
            y_ranges.append((start_y, height))
            
        print(f"Trovate {len(y_ranges)} righe di contenuto.")
        
        count = 0
        final_crops = []

        # Per ogni striscia orizzontale, trova le colonne
        for (y1, y2) in y_ranges:
            strip_h = y2 - y1
            # Ignora strisce troppo sottili (es. solo testo piccolo o linee)
            if strip_h < 100: 
                continue
                
            # Ora scansiona X in questa striscia
            col_has_content = []
            for x in range(width):
                has_content = False
                for y in range(y1, y2, 5):
                    if pixels[x, y] > 0:
                        has_content = True
                        break
                col_has_content.append(has_content)
                
            x_ranges = []
            in_x = False
            start_x = 0
            for x, has in enumerate(col_has_content):
                if has and not in_x:
                    start_x = x
                    in_x = True
                elif not has and in_x:
                    if x - start_x > 50:
                        x_ranges.append((start_x, x))
                    in_x = False
            if in_x and width - start_x > 50:
                x_ranges.append((start_x, width))
                
            # Salva i crop
            for (x1, x2) in x_ranges:
                # Verifica aspect ratio per escludere i banner orizzontali lunghi
                w_crop = x2 - x1
                h_crop = y2 - y1
                ratio = w_crop / h_crop
                
                # Le card sono verticali o quadrate (ratio < 2). I banner sono larghissimi (ratio > 3)
                if ratio < 3.0:
                    crop = img.crop((x1, y1, x2, y2))
                    filename = f"img/crop_{count}.jpg"
                    crop.save(filename, quality=95)
                    print(f"Salvato {filename} (w={w_crop}, h={h_crop}, ratio={ratio:.2f})")
                    final_crops.append(filename)
                    count += 1
            
        print(f"Totale salvati: {count}")

    except Exception as e:
        print(f"Errore: {e}")

if __name__ == "__main__":
    split_image()
