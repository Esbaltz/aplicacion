import { Injectable, inject } from "@angular/core";
import { DocumentReference, Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, getDoc, setDoc, updateDoc } from "@angular/fire/firestore";
import {v4 as uuidv4} from 'uuid';
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class FireStoreService {

    private firestore : Firestore = inject(Firestore);

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
    
}

