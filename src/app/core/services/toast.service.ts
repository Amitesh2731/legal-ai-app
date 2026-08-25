import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) {}

  async showSuccess(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle-outline',
      cssClass: 'custom-toast toast-success',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async showError(message: string, duration: number = 4000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle-outline',
      cssClass: 'custom-toast toast-error',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async showWarning(message: string, duration: number = 3500): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color: 'warning',
      icon: 'warning-outline',
      cssClass: 'custom-toast toast-warning',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async showInfo(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'top',
      color: 'primary',
      icon: 'information-circle-outline',
      cssClass: 'custom-toast toast-info',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
