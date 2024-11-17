import { Injectable, inject } from "@angular/core";
import { DocumentReference, Firestore, addDoc, arrayUnion, collection, collectionData, deleteDoc, doc, docData, getDoc, query, setDoc, updateDoc, where } from "@angular/fire/firestore";
import {v4 as uuidv4} from 'uuid';
import { Observable, map } from "rxjs";
import { Alumno, Clases } from "../interfaces/iusuario";

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
      // Referencia al documento de la clase en la colección 'Clases'
      const claseRef = doc(this.firestore, `Clases/${id_clase}`);
    
      try {
        // Actualizamos el campo 'alumnos' utilizando 'arrayUnion' para agregar el id del alumno
        await updateDoc(claseRef, {
          alumnos: arrayUnion(id_alumno)  // Solo agregamos el ID del alumno
        });
    
        console.log(`Alumno con ID ${id_alumno} agregado correctamente a la clase ${id_clase}`);
      } catch (error) {
        console.error("Error al agregar alumno a la clase:", error);
      }
    } 
    
}

