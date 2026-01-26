import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

@Component({
  selector: 'app-modal-escaner',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-escaner.html',
  styleUrl: './modal-escaner.css',
})
export class ModalEscaner implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() qrScanned = new EventEmitter<string>();
  @ViewChild('video') videoElement!: ElementRef;

  private codeReader: BrowserMultiFormatReader | null = null;
  scannedResult: string | null = null;
  error: string = '';
  scanning: boolean = false;
  selectedCamera: string = 'back';
  cameras: any[] = [];
  camaraSeleccionada: string = '';
  closing: boolean = false;

  constructor(private cdr: ChangeDetectorRef) { }


  ngOnInit() {
    this.codeReader = new BrowserMultiFormatReader();
    this.listCameras();
  }

  startScanning() {
    if (!this.codeReader || !this.videoElement) return;


    this.scanning = true;
    this.error = '';
    this.cdr.detectChanges();//Para que pille el estado del botón activar cámara(En escaneando)

    this.codeReader.decodeFromVideoDevice(
      this.camaraSeleccionada,
      this.videoElement.nativeElement,
      (result, err) => {
        if (result) {
          console.log('✅ QR DETECTADO:', result.getText());
          this.scannedResult = result.getText();
          
          this.qrScanned.emit(this.scannedResult);
          this.stopScanning();
        }
        // NO imprimas el error de NotFoundException, es normal
        if (err && !(err instanceof NotFoundException)) {
          console.error('❌ ERROR REAL:', err);
          this.error = err.message;
         
        }
        this.cdr.detectChanges();//Pra que el scannedResult se actualice en el DOM
      }
    );
  }

  stopScanning() {
    if (this.codeReader) {
      this.codeReader.reset();
      this.scanning = false;
    }
  }

  closeEscanerModal() {
    this.closing = true;
    this.stopScanning();
    setTimeout(() => {
      this.closeModal.emit();
    }, 150);
  }

  onCameraChange() {
    //Si el usuario escoge la cámara frontal escogemos la posicion 1 del array y si es back la 0 del array
    this.selectedCamera == 'front' ? this.camaraSeleccionada = this.cameras[0].deviceId : this.camaraSeleccionada = this.cameras[1].deviceId;
    if (this.scanning) {
      this.stopScanning();
      setTimeout(() => this.startScanning(), 500);
    }
  }

  //Método para obtener el nombre de las cámaras
  async listCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras = devices.filter(device => device.kind === 'videoinput');

      if (this.cameras.length > 0) {
        this.camaraSeleccionada = this.cameras[1].deviceId;//La pos 1 es la back de la cámara en general
      }
    } catch (error) {
      console.error('Error obteniendo cámaras:', error);
    }
  }
}
