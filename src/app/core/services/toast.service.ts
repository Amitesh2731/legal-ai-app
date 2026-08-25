import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private toastController: ToastController) {}

  async showSuccess(titleOrMessage: string, message?: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      header: message ? titleOrMessage : undefined,
      message: message ? message : titleOrMessage,
      duration,
      position: 'top',
      icon: 'checkmark-circle',
      cssClass: 'modern-toast toast-success',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async showError(titleOrMessage: string, message?: string, duration: number = 4000): Promise<void> {
    const toast = await this.toastController.create({
      header: message ? titleOrMessage : undefined,
      message: message ? message : titleOrMessage,
      duration,
      position: 'top',
      icon: 'alert-circle',
      cssClass: 'modern-toast toast-error',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async showWarning(titleOrMessage: string, message?: string, duration: number = 3500): Promise<void> {
    const toast = await this.toastController.create({
      header: message ? titleOrMessage : undefined,
      message: message ? message : titleOrMessage,
      duration,
      position: 'top',
      icon: 'warning',
      cssClass: 'modern-toast toast-warning',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }

  async showInfo(titleOrMessage: string, message?: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      header: message ? titleOrMessage : undefined,
      message: message ? message : titleOrMessage,
      duration,
      position: 'top',
      icon: 'information-circle',
      cssClass: 'modern-toast toast-info',
      buttons: [{ icon: 'close', role: 'cancel' }]
    });
    await toast.present();
  }
}
