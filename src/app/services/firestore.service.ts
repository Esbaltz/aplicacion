import { Injectable, inject } from "@angular/core";
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, docData, setDoc, updateDoc, query, where, } from "@angular/fire/firestore";
import { v4 as uuidv4 } from 'uuid';
import { Observable, map } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FireStoreService {

    private firestore: Firestore = inject(Firestore);

    constructor() {}
    
    getCollectionChanges<tipo>(path: string): Observable<tipo[]> {
        const itemCollection = collection(this.firestore, path);
        return collectionData(itemCollection) as Observable<tipo[]>;
    }

    getDocument<tipo>(collectionName: string, id: string): Observable<tipo | undefined> {
        const documentReference = doc(this.firestore, `${collectionName}/${id}`);
        return docData(documentReference, { idField: 'id' }) as Observable<tipo | undefined>;
    }

    createDocument(data: any, enlace: string): Promise<void> {
        const document = doc(this.firestore, enlace);
        return setDoc(document, data);
    }

    createDocumentID(data: any, enlace: string, idDoc: string): Promise<void> {
        const document = doc(this.firestore, `${enlace}/${idDoc}`);
        return setDoc(document, data);
    }

    async updateDocumentID(data: any, enlace: string, idDoc: string): Promise<void> {
        const document = doc(this.firestore, `${enlace}/${idDoc}`);
        return updateDoc(document, data);
    }

    async updateAsistenciaAlumno(enlace: string, idDoc: string, nuevoEstado: string, fechaNueva: Date): Promise<void> {
        const document = doc(this.firestore, `${enlace}/${idDoc}`);
        return updateDoc(document, { estado: nuevoEstado, fecha_hora: fechaNueva });
    }

    deleteDocumentID(enlace: string, idDoc: string): Promise<void> {
        const document = doc(this.firestore, `${enlace}/${idDoc}`);
        return deleteDoc(document);
    }

    // Genera un ID único utilizando uuidv4
    generateId(): string {
        return uuidv4();
    }

    createIdDoc() {
        let uuidv = uuidv4();
        return uuidv
      }

    // Método para guardar asistencia
    guardarAsistencia(asistenciaData: any): Promise<void> {
        const asistenciaId = asistenciaData.id_asistencia || this.generateId();
        const documentRef = doc(this.firestore, `Asistencia/${asistenciaId}`);
        return setDoc(documentRef, asistenciaData);
    }

    getAttendanceRecord(id_clase: string, id_sesion: string, id_alumno: string) {
        const attendanceCollection = collection(this.firestore, 'Asistencia');
        const q = query(
          attendanceCollection,
          where('id_clase', '==', id_clase),
          where('id_sesion', '==', id_sesion),
          where('id_alumno', '==', id_alumno)
        );
        return collectionData(q, { idField: 'id' }).pipe(
          map(records => records.length > 0 ? records[0] : null)
        ).toPromise();
      }

    getAttendanceList(id_clase: string, id_sesion: string) {
        const attendanceCollection = collection(this.firestore, 'Asistencia');
        const q = query(attendanceCollection, 
            where('id_clase', '==', id_clase), 
            where('id_sesion', '==', id_sesion,));
        return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    }

    getStudentAttendance(id_clase: string, id_sesion: string, id_alumno: string) {
        const attendanceCollection = collection(this.firestore, 'Asistencia');
        const q = query(attendanceCollection, where('id_clase', '==', id_clase), where('id_sesion', '==', id_sesion), where('id_alumno', '==', id_alumno));
        return collectionData(q, { idField: 'id' }) as Observable<any[]>;
    }

    getUserById(id_usuario: string): Observable<any> {
        const userDocRef = doc(this.firestore, `Usuarios/${id_usuario}`);
        return docData(userDocRef, { idField: 'id' }) as Observable<any>;
      }
}
