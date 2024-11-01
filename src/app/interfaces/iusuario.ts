export interface Usuario{
    correo:string,
    password:string,
    nombre:string,
    apellido:string,
    rol : string
}

export interface Clases{
    nomb_clase : string,
    semestre : number,
    estado : string,
    id_docente : Usuario[];
}

export interface Sesiones {
    fecha_hora : Date
    id_clase : Clases[],
    qr_code : string

}

export interface Asistencia{
    fecha_hora : Date
    id_alumno : Usuario[]
    id_sesion : Sesiones[]

}