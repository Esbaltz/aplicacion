export interface Usuario{
    correo:string
    password:string
    nombre:string
    apellido:string
    rol : string
    id_usuario :string
}

export interface Clases{
    nomb_clase : string,
    semestre : number,
    estado : string,
    id_docente : any
    id_clase : string
    id_alumno : any
}

export interface Sesiones {
    fecha_hora : Date
    id_clase : any
    qr_code : string
    id_sesion : string

}

export interface Asistencia{
    fecha_hora : Date
    id_alumno : any
    id_sesion : any
    estado : string
    id_asistencia : string
}