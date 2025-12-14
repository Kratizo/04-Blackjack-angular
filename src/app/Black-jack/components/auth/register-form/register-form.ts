import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'register-form',
  imports: [FormsModule],
  templateUrl: './register-form.html',
})
export class RegisterFormComponent {
  close = output<void>();
  save = output<any>();

  alias = signal('');
  password = signal('');
  confirmPassword = signal('');
  imageUrl = signal('');

  onClose() {
    this.close.emit();
  }

  onSave() {
    if (!this.alias() || !this.password()) {
        alert('Por favor completa todos los campos');
        return;
    }

    if (this.password() !== this.confirmPassword()) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.save.emit({
      alias: this.alias(),
      password: this.password(),
      imageUrl: this.imageUrl()
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Basic size check (e.g. limit to 5MB input to avoid crashing browser memory)
      if (file.size > 5 * 1024 * 1024) {
          alert("La imagen es demasiado grande. Por favor elige una imagen menor a 5MB.");
          return;
      }

      this.compressImage(file, 200, 0.7).then(compressedDataUrl => {
          this.imageUrl.set(compressedDataUrl);
      }).catch(err => {
          console.error("Error compressing image", err);
          alert("Error al procesar la imagen.");
      });
    }
  }

  compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const elem = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                elem.width = width;
                elem.height = height;

                const ctx = elem.getContext('2d');
                if (!ctx) {
                    reject("Canvas context not available");
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG/WEBP
                resolve(elem.toDataURL('image/jpeg', quality));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
  }
}
