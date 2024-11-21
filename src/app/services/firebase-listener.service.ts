import { Injectable } from "@angular/core";
import { Firestore, onSnapshot, doc, collection, collectionData, query, where } from "@angular/fire/firestore";
import { ToastController } from '@ionic/angular';  // Para mostrar notificaciones
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FirebaseListenerService {

  constructor(
    private firestore: Firestore, 
    private toastController: ToastController
  ) {}

  // Método para escuchar cambios en un documento específico
  listenToDocumentChanges<tipo>(collectionName: string, id: string): Observable<tipo | undefined> {
    const documentRef = doc(this.firestore, `${collectionName}/${id}`);

    return new Observable(observer => {
      const unsubscribe = onSnapshot(documentRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as tipo;
          console.log(`Documento con ID ${id} ha sido actualizado.`);
          this.presentToast(`El documento ${id} ha sido actualizado!`, 'success');
          observer.next(data);
        } else {
          console.log(`El documento ${id} ya no existe.`);
          observer.next(undefined); // Si el documento no existe
        }
      }, (error) => {
        observer.error(error); // Manejo de errores
      });

      return () => unsubscribe();
    });
  }

  // Método para escuchar la creación de nuevos documentos en una colección
  listenToNewDocuments<tipo>(collectionName: string): Observable<tipo> {
    const collectionRef = collection(this.firestore, collectionName);

    return new Observable(observer => {
      const unsubscribe = onSnapshot(collectionRef, (querySnapshot) => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type === 'added') {  // Solo cuando un documento ha sido agregado
            const data = change.doc.data() as tipo;
            console.log(`Nuevo documento añadido en la colección ${collectionName}.`);
            this.presentToast(`¡Nuevo Curso disponible!`, 'success');
            observer.next(data);
          }
        });
      }, (error) => {
        observer.error(error); // Manejo de errores
      });

      return () => unsubscribe();
    });
  }

  // Función para mostrar un toast en Ionic
  private async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,  // 'success', 'danger', 'primary', etc.
      position: 'top'
    });
    toast.present();
  }
}
