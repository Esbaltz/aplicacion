import { Injectable, inject } from "@angular/core";
import { DocumentReference, Firestore, addDoc, arrayUnion, collection, collectionData, deleteDoc, doc, docData, getDoc, onSnapshot, query, setDoc, updateDoc, where } from "@angular/fire/firestore";
import {v4 as uuidv4} from 'uuid';
import { Observable, map } from "rxjs";
import { Alumno, Clases } from "../interfaces/iusuario";
import { ToastController } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})

export class FireStoreService {

    private firestore : Firestore = inject(Firestore);
    private toastController: ToastController = inject(ToastController);  
    constructor() {}
    
      // Para leer una coleccion o tabla de la base de datos
      getCollectionChanges<tipo>(path: string) {
        const itemCollection = collection(this.firestore, path);
        return collectionData(itemCollection) as Observable<tipo[]>;
      }
      
      getDocument<tipo>(collectionName: string, id: string): Observable<tipo | undefined> {
        const documentReference = doc(this.firestore, `${collectionName}/${id}`);
        return docData(documentReference, { idField: 'id' }) as Observable<tipo | undefined>;
      }
    
      getDocumentChanges<tipo>(enlace: string) {
        console.log('getDocumentChanges -> ', enlace);
        const document = doc(this.firestore, enlace);
        return docData(document) as Observable<tipo>;
      }
      
      createDocument(data: any, enlace: string , ) {
        const document = doc(this.firestore, enlace);
        return setDoc(document, data);
      }
      
      // Para crear un documento con id Personalizado
      createDocumentID(data: any, enlace: string, idDoc: string) {
        const document = doc(this.firestore, `${enlace}/${idDoc}`);
        return setDoc(document, data);
      }
      
      async updateDocumentID(data: any, enlace: string, idDoc: string) {
        const document = doc(this.firestore, `${enlace}/${idDoc}`);
        return updateDoc(document, data)
      }
    
      async updateDocument(data: any, enlace: string) {
        const document = doc(this.firestore, enlace);
        return updateDoc(document, data)
      }
      //Actualiza la asistencia del alumno
      async updateAsistenciaAlumno(enlace: string, idDoc: string, NuevoEstado: string , FechaNueva : Date) {
        const document = doc(this.firestore, `${enlace}/${idDoc}`);
        return updateDoc(document, { estado: NuevoEstado, fecha_hora : FechaNueva });
      }

    
      deleteDocumentID(enlace: string, idDoc: string) {
        const document = doc(this.firestore, `${enlace}/${idDoc}`);
        return deleteDoc(document);
      }
    
      deleteDocFromRef(ref: any) {
        return deleteDoc(ref)
      }
      
      // Crea un Id para el documento
      createIdDoc() {
        let uuidv = uuidv4();
        return uuidv
      }

      // Para scanear bueno
      getAttendanceRecord(id_clase: string, id_sesion: string, id_alumno: string) {
        const attendanceCollection = collection(this.firestore, 'Asistencia');
        const q = query(
          attendanceCollection,
          where('id_clase', '==', id_clase),
          where('id_sesion', '==', id_sesion),
          where('id_alumno', '==', id_alumno)
        );
      
        return collectionData(q, { idField: 'id' }).pipe(
          map(records => {
            console.log('Registros obtenidos:', records);  // Depuración para revisar los registros
            return records.length > 0 ? records[0] : null;
          })
        ).toPromise();
      }

      guardarAsistencia(asistenciaData: any): Promise<void> {
        const asistenciaId = asistenciaData.id_asistencia || this.createIdDoc();
        const documentRef = doc(this.firestore, `Asistencia/${asistenciaId}`);
        return setDoc(documentRef, asistenciaData);
    }

    async agregarAlumnoAClase(id_clase: string, id_alumno: string): Promise<void> {
      const claseRef = doc(this.firestore, `Clases/${id_clase}`);
    
      try {
        await updateDoc(claseRef, {
          alumnos: arrayUnion(id_alumno)  
        });
    
        console.log(`Alumno con ID ${id_alumno} agregado correctamente a la clase ${id_clase}`);
      } catch (error) {
        console.error("Error al agregar alumno a la clase:", error);
      }
    } 

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
            if (change.type === 'added') {
              const data = change.doc.data() as tipo;
              console.log(`Nuevo documento añadido en la colección ${collectionName}.`);
              this.presentToast(`¡Nuevo documento añadido a la colección ${collectionName}!`, 'success');
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

