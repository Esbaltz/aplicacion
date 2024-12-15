import { Timestamp } from "@angular/fire/firestore"

export interface Usuario{
    correo:string
    password:string
    nombre:string
    apellido:string
    rol : string
    id_usuario :string
}

export interface Alumno {

}

export interface Clases{
    nomb_clase : string,
    semestre : number,
    estado : string,
    id_docente : any
    id_clase : string
    alumnos : Alumno[]
    descripcion : string
    seccion_num : number
    seccion_letra : string
    nomb_docente : string
}

export interface Sesiones {
    fecha_hora : Date | Timestamp
    id_clase : any
    qr_code : string
    id_sesion : string
    id_docente : any
    descripcion :string

}

export interface Asistencia{
    fecha_hora : Date
    id_alumno : any
    id_sesion : any
    id_clase : any
    estado : string
    id_asistencia : string
}