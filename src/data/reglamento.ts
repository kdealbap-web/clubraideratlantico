export interface ReglamentoArticulo {
  n: string;
  t: string;
  d: string;
}

export interface ReglamentoTitulo {
  id: string;
  n: string;
  t: string;
  items: ReglamentoArticulo[];
}

export const REGLAMENTO: ReglamentoTitulo[] = [
  {
    id: 'titulo-1',
    n: 'I',
    t: 'Identidad y propósito',
    items: [
      {
        n: '1.1',
        t: 'Quiénes somos',
        d: 'Club Raider Atlántico es una comunidad sin ánimo de lucro de motociclistas en el Caribe colombiano, fundada el 15 de julio de 2022. La membresía es gratuita y está abierta a pilotos con cualquier marca o modelo de motocicleta.',
      },
      {
        n: '1.2',
        t: 'Propósito',
        d: 'Promover la pasión por el motociclismo, la seguridad vial, la hermandad entre pilotos y el descubrimiento de rutas en la región. El parche se gana rodando con respeto y disciplina.',
      },
      {
        n: '1.3',
        t: 'Apoliticidad',
        d: 'El club no se vincula con partidos políticos, religiones organizadas ni intereses comerciales. Cada piloto es bienvenido independiente de sus posturas personales, mientras se respete a los demás.',
      },
    ],
  },
  {
    id: 'titulo-2',
    n: 'II',
    t: 'Membresía',
    items: [
      {
        n: '2.1',
        t: 'Requisitos de ingreso',
        d: 'Para iniciar el camino al parche del club necesitas: (a) Ser mayor de edad (18+). (b) Moto propia en buenas condiciones para ruta. (c) Licencia de conducción vigente. (d) Documentación al día — SOAT y tecnomecánica cuando aplique. Sin papeles, no hay ruta.',
      },
      {
        n: '2.2',
        t: 'Sin costo',
        d: 'La inscripción y la membresía son completamente gratuitas. El club no cobra mensualidad, cuotas de ingreso ni comisiones por rodadas.',
      },
      {
        n: '2.3',
        t: 'Proceso de solicitud',
        d: 'El ingreso se realiza únicamente desde el formulario en clubraideratlantico.com/unete. Si cumples con los requisitos, el ingreso al grupo de Aspirantes es inmediato. Si pasa una semana desde tu solicitud sin completar tus datos en la base, la solicitud se rechaza automáticamente.',
      },
      {
        n: '2.4',
        t: 'Estados de membresía',
        d: 'Pendiente (solicitud en revisión) · Aspirante (ingresado, en evaluación) · Piloto Oficial · Líder / Editor / Administrador (comité) · Inactivo (seis meses sin participación) · Retirado (violación grave del reglamento).',
      },
    ],
  },
  {
    id: 'titulo-3',
    n: 'III',
    t: 'Jerarquía y programa de Aspirantes',
    items: [
      {
        n: '3.1',
        t: 'Rangos del club',
        d: 'La jerarquía operativa va de menor a mayor: General (recién registrado) → Aspirante (con participación activa) → Piloto Oficial (parche oficial). Sobre estos rangos están los del comité: Editor, Líder y Administrador. El rol Co-Piloto es transversal y se asigna a parrilleros registrados.',
      },
      {
        n: '3.2',
        t: 'General — el punto de partida',
        d: 'Todo miembro que se registra ingresa como General. Es el rango base: tiene acceso al portal personal, puede acompañar rodadas cumpliendo equipo y documentos, pero aún no compite por el parche oficial. La promoción a Aspirante es a discreción del comité con base en participación activa.',
      },
      {
        n: '3.3',
        t: 'Aspirante — filosofía del programa',
        d: 'El cronómetro no corre — tu actitud habla por ti. No hay tiempo fijo para el ascenso a Piloto Oficial. La evaluación es constante y depende 100% del aspirante: su disciplina, su pasión y su rodaje.',
      },
      {
        n: '3.4',
        t: 'Criterios de evaluación a Piloto Oficial',
        d: 'Participación activa en el día a día del club · Asistencia constante a rodadas y reuniones · Apoyo en logística de eventos · Compromiso y actitud de respeto · Documentos siempre al día · Intención clara de convertirse en Piloto Oficial · No incurrir en faltas descritas en este reglamento.',
      },
      {
        n: '3.5',
        t: 'Ascenso a Piloto Oficial',
        d: 'El paso de Aspirante a Piloto Oficial es a discreción del comité administrador con base en los criterios anteriores. No hay plazo mínimo ni máximo. Cuando el comité considere que el aspirante está listo, se hace el ascenso con anuncio formal en el grupo.',
      },
      {
        n: '3.6',
        t: 'Acompañantes en rodada (no miembros)',
        d: 'Quien no esté inscrito en el club puede participar en una rodada como acompañante, siempre y cuando cumpla con la vestimenta de seguridad, tenga la documentación al día y acate todas las recomendaciones del grupo de rutas. El acompañamiento no equivale a membresía.',
      },
    ],
  },
  {
    id: 'titulo-4',
    n: 'IV',
    t: 'Conducta y disciplina',
    items: [
      {
        n: '4.1',
        t: 'Respeto',
        d: 'Cero tolerancia a discriminación, acoso, amenazas o agresiones — verbales o físicas — entre miembros, hacia invitados o terceros en la vía.',
      },
      {
        n: '4.2',
        t: 'Vía y peatones',
        d: 'Respeto absoluto a peatones, ciclistas y otros conductores. Prohibido el adelantamiento agresivo, el ruido excesivo en zonas residenciales y las maniobras temerarias.',
      },
      {
        n: '4.3',
        t: 'Alcohol y sustancias',
        d: 'Prohibido pilotear en rodadas oficiales bajo efectos de alcohol o sustancias psicoactivas. Cero excepciones.',
      },
      {
        n: '4.4',
        t: 'Sanciones',
        d: 'Llamado de atención · Suspensión temporal · Retiro definitivo. El comité de disciplina decide caso a caso con derecho a réplica del miembro.',
      },
    ],
  },
  {
    id: 'titulo-5',
    n: 'V',
    t: 'Rodadas oficiales',
    items: [
      {
        n: '5.1',
        t: 'Briefing obligatorio',
        d: 'Toda rodada oficial inicia con briefing de seguridad: ruta, paradas, señales del pelotón, líder, cierre y comunicación de emergencia. La asistencia al briefing es requisito para participar.',
      },
      {
        n: '5.2',
        t: 'Equipo mínimo',
        d: 'Casco certificado, chaqueta o protección de torso, guantes y calzado cerrado. El club puede exigir requisitos adicionales según la ruta.',
      },
      {
        n: '5.3',
        t: 'Documentación obligatoria',
        d: 'Para rodadas en vía pública: licencia de conducción vigente, SOAT al día, tecnomecánica al día (cuando aplique según el modelo) y tarjeta de propiedad. Sin papeles, no hay ruta. La verificación es responsabilidad del coordinador de ruta antes del briefing.',
      },
      {
        n: '5.4',
        t: 'Formación de pelotón',
        d: 'Líder al frente, cierre al final, formación en zigzag a velocidad de crucero. Distancia mínima 2 segundos entre motos. Comunicación con señales de mano según código del club.',
      },
      {
        n: '5.5',
        t: 'Copilotos / parrilleros',
        d: 'Los copilotos son bienvenidos siempre que cuenten con casco propio, equipo mínimo y vayan con piloto del club. El piloto es responsable directo de su copiloto durante toda la rodada.',
      },
    ],
  },
  {
    id: 'titulo-6',
    n: 'VI',
    t: 'Estructura del club',
    items: [
      {
        n: '6.1',
        t: 'Comité directivo',
        d: 'Administradores y Líderes del club. Responsables de aprobaciones, decisiones de disciplina y gestión del sitio web. Elegidos por consenso del comité existente.',
      },
      {
        n: '6.2',
        t: 'Grupos operativos',
        d: 'Disciplina (revisión de conducta y sanciones) · Ruta (planeación y coordinación de rodadas) · Contenido (galería, noticias, comunicación pública). Cada grupo tiene coordinador.',
      },
      {
        n: '6.3',
        t: 'Pilotos oficiales',
        d: 'Miembros activos con derecho a participar en todas las rodadas oficiales. Pueden ser invitados a roles de comité por su trayectoria.',
      },
    ],
  },
  {
    id: 'titulo-7',
    n: 'VII',
    t: 'Datos y privacidad',
    items: [
      {
        n: '7.1',
        t: 'Datos personales',
        d: 'El club recolecta nombre, fecha de nacimiento, contacto, datos de moto y contacto de emergencia con fines de seguridad y logística. No se comparten con terceros.',
      },
      {
        n: '7.2',
        t: 'Imagen',
        d: 'En rodadas oficiales se realizan tomas de fotografía y video. Al participar, el miembro autoriza el uso no comercial de su imagen en redes y galería del club. Puede solicitar retiro escribiendo a info@clubraideratlantico.com.',
      },
    ],
  },
];
