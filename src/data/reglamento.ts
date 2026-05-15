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

export const REGLAMENTO_META = {
  titulo: 'Club Raider Atlántico — Reglamento Interno',
  subtitulo: 'La Nueva Generación del Atlántico',
  version: 'Versión 02',
  fecha: '5 de mayo de 2026',
  ciudad: 'Barranquilla, Colombia',
  fundador: 'Julio Ramírez',
  pdfUrl: '/reglamento.pdf',
} as const;

export const REGLAMENTO: ReglamentoTitulo[] = [
  {
    id: 'titulo-1',
    n: '1',
    t: 'Objetivo general',
    items: [
      {
        n: '1.1',
        t: 'Propósito del reglamento',
        d: 'Establecer las normas, responsabilidades y obligaciones de los miembros del Club Raider Atlántico, con el fin de garantizar la participación, el compromiso, la disciplina y el sentido de pertenencia. Este reglamento busca fortalecer la cohesión grupal, promover la cultura de seguridad vial y asegurar el crecimiento sostenido del club en cada una de sus actividades.',
      },
    ],
  },
  {
    id: 'titulo-2',
    n: '2',
    t: 'Estructura del club',
    items: [
      {
        n: '2.0',
        t: 'Cinco niveles jerárquicos',
        d: 'El club está organizado en cinco niveles con funciones específicas: Grupo General (participantes, invitados y simpatizantes) · Aspirantes (en proceso de integración y evaluación) · Pilotos Oficiales (miembros activos con plenos derechos y distintivos) · Líderes del Club (dirección estratégica y representación) · Grupo de Disciplina (supervisión y cumplimiento de normas).',
      },
      {
        n: '2.1',
        t: 'Grupo General — responsabilidades',
        d: 'Respetar las normas básicas del club durante cada actividad o evento. Mantener una conducta apropiada y ejemplar durante rodadas y encuentros. Seguir las indicaciones de líderes y organizadores en todo momento. Velar activamente por su propia seguridad y la integridad de todo el grupo.',
      },
      {
        n: '2.1.2',
        t: 'Grupo General — obligaciones',
        d: 'Cumplir en todo momento con las normas de seguridad vial vigentes. Mantener respeto incondicional hacia todos los miembros del club. No interferir en la organización interna ni en la toma de decisiones del club. Acatar con disciplina las instrucciones impartidas durante las actividades.',
      },
      {
        n: '2.1.3',
        t: 'Grupo General — limitaciones',
        d: 'No tienen derecho a voto en las decisiones formales del club. No pueden portar los distintivos oficiales del Club Raider. No participan en la organización interna del club. No están autorizados para representar oficialmente al club ante terceros.',
      },
      {
        n: '2.2',
        t: 'Aspirantes — responsabilidades',
        d: 'Asistir puntualmente a las actividades programadas por el club. Participar activamente en eventos, rodadas y jornadas de integración. Mantener comunicación constante y fluida con los líderes y miembros. Representar adecuadamente los valores e imagen del club en todo momento. Cumplir los horarios establecidos y respetar las normas del club. Mantener su motocicleta en condiciones óptimas de seguridad y funcionamiento. Practicar y promover la seguridad vial en cada salida. Brindar apoyo solidario a sus compañeros durante el recorrido y en ruta.',
      },
      {
        n: '2.2.2',
        t: 'Aspirantes — obligaciones',
        d: 'Cumplir con el mínimo de asistencia requerido por el club. Respetar la jerarquía y estructura organizacional del club. Mantener en todo momento una actitud de respeto y colaboración. Completar satisfactoriamente el período de prueba establecido para su integración.',
      },
      {
        n: '2.3',
        t: 'Pilotos Oficiales — responsabilidades',
        d: 'Ser referentes de comportamiento, disciplina y valores del club. Liderar y apoyar activamente la organización de actividades. Guiar y orientar a los aspirantes durante su proceso de integración. Representar dignamente al club en eventos internos y externos. Promover la unión, el respeto y la sana convivencia en el grupo. Cumplir y hacer cumplir el reglamento interno del club. Aportar ideas constructivas orientadas al crecimiento del club.',
      },
      {
        n: '2.3.2',
        t: 'Pilotos Oficiales — obligaciones',
        d: 'Mantener un nivel de asistencia alto y constante. Cumplir con los compromisos económicos establecidos por el club. Portar los distintivos oficiales del Club Raider en los eventos internos o externos. Respetar y acatar las normas y decisiones del club. Mantener comunicación activa con líderes y demás miembros. Apoyar proactivamente la organización, logística y ejecución de eventos.',
      },
      {
        n: '2.4',
        t: 'Líderes del Club — responsabilidades',
        d: 'Dirigir, coordinar y orientar el club hacia su visión. Tomar decisiones estratégicas en beneficio del colectivo. Garantizar el cumplimiento efectivo del reglamento y las normas del club. Motivar y fomentar la participación activa de todos los miembros. Resolver conflictos internos con objetividad, justicia y ecuanimidad. Representar oficialmente al club ante organismos externos. Velar permanentemente por la seguridad e integridad del grupo. Impulsar el crecimiento, visibilidad y reconocimiento del club.',
      },
      {
        n: '2.4.2',
        t: 'Líderes del Club — obligaciones',
        d: 'Mantener un compromiso total e incondicional con el club. Administrar los recursos del club con responsabilidad y transparencia. Actuar siempre con integridad, imparcialidad y ética. Planificar y ejecutar las actividades del club con antelación. Comunicar con claridad y oportunidad las decisiones tomadas. Escuchar y considerar las propuestas de todos los miembros. Rendir cuentas de manera transparente ante el club cuando sea requerido.',
      },
      {
        n: '2.5',
        t: 'Grupo de Disciplina — objetivo y responsabilidades',
        d: 'Velar por el cumplimiento estricto de las normas del club, mantener el orden interno y garantizar procesos justos e imparciales ante cualquier falta o incumplimiento. Supervisar el comportamiento de los miembros en todas las actividades. Evaluar las faltas e incumplimientos de manera objetiva, imparcial y fundamentada. Apoyar a los líderes en la aplicación del régimen disciplinario. Mediar en conflictos internos antes de escalar las situaciones. Garantizar el respeto permanente de las normas y valores del club. Emitir recomendaciones claras y documentadas sobre sanciones o correctivos aplicables.',
      },
      {
        n: '2.5.2',
        t: 'Grupo de Disciplina — obligaciones',
        d: 'Actuar siempre con imparcialidad, ética profesional y coherencia. Mantener la confidencialidad absoluta en los casos que se traten. Basar sus decisiones exclusivamente en hechos verificables, no en opiniones. Comunicar sus decisiones de forma clara, respetuosa y fundamentada. Trabajar en estrecha colaboración con los líderes del club. Documentar formalmente todas las situaciones disciplinarias para su registro y seguimiento.',
      },
    ],
  },
  {
    id: 'titulo-3',
    n: '3',
    t: 'Normas de conducta y convivencia',
    items: [
      {
        n: '3.1',
        t: 'Compañerismo y respeto',
        d: 'Fomentar permanentemente el compañerismo, la solidaridad y el respeto mutuo entre los miembros en todo momento, brindando apoyo incondicional en todas las circunstancias.',
      },
      {
        n: '3.2',
        t: 'Representación en eventos',
        d: 'Solicitar y obtener autorización expresa de los líderes antes de representar al club en eventos de carácter extraoficial.',
      },
      {
        n: '3.3',
        t: 'Afiliaciones con otros grupos',
        d: 'Está prohibido ser integrante activo de otros grupos moteros, con excepción de filiales del Club Raider en otras ciudades o países.',
      },
      {
        n: '3.4',
        t: 'Obediencia a líderes y grupo de ruta',
        d: 'Acatar con disciplina y sin dilación las indicaciones impartidas por los líderes y el grupo de ruta durante las actividades.',
      },
      {
        n: '3.5',
        t: 'Indumentaria y protección',
        d: 'Es obligatorio portar las prendas oficiales del club y la indumentaria de protección adecuada en todos los viajes programados (pantalón grueso y sin roturas y calzado cerrado como mínimo).',
      },
      {
        n: '3.6',
        t: 'Producción y venta de indumentaria',
        d: 'La producción y comercialización de indumentaria del club se realizará exclusivamente en beneficio colectivo del club, quedando terminantemente prohibido el lucro personal.',
      },
      {
        n: '3.7',
        t: 'Vestimenta adecuada en eventos',
        d: 'No se permitirá la participación en eventos del club sin la vestimenta reglamentaria correspondiente (pantalón reforzado sin roturas y calzado cerrado).',
      },
      {
        n: '3.8',
        t: 'Consumo de bebidas embriagantes',
        d: 'Queda estrictamente prohibido consumir alcohol y conducir bajo los efectos de este y/o sustancias psicoactivas en cualquier actividad del club. Esta restricción no aplica para copilotos en actividades recreativas debidamente autorizadas.',
      },
      {
        n: '3.9',
        t: 'Ascenso de aspirantes',
        d: 'Los aspirantes que sean ascendidos adquirirán la categoría de Pilotos Oficiales en período de prueba por un lapso de tres (3) meses.',
      },
      {
        n: '3.10',
        t: 'Documentación vigente',
        d: 'Pilotos, aspirantes y cualquier persona que desee participar en rodadas con el club deberán tener la totalidad de sus documentos de tránsito y personales en plena vigencia.',
      },
    ],
  },
  {
    id: 'titulo-4',
    n: '4',
    t: 'Clasificación de faltas y sanciones',
    items: [
      {
        n: '4.0',
        t: 'Niveles de gravedad',
        d: 'Nivel Alto → Expulsión inmediata e indefinida del Club. · Nivel Medio → Suspensión temporal en la participación de actividades. · Nivel Bajo → Llamado de atención formal.',
      },
      {
        n: '4.1.1',
        t: 'Nivel Alto — acumulación de faltas',
        d: 'Pilotos oficiales que acumulen tres (3) faltas disciplinarias de nivel medio o bajo de manera reiterada.',
      },
      {
        n: '4.1.2',
        t: 'Nivel Alto — participación en otro grupo motero',
        d: 'Ser miembro activo de otro grupo o asociación de actividades moteras, a excepción de filiales del Club Raider en otras ciudades o países.',
      },
      {
        n: '4.1.3',
        t: 'Nivel Alto — producción y venta no autorizada',
        d: 'Realizar producción y/o venta no autorizada de indumentaria del club con fines de lucro personal.',
      },
      {
        n: '4.1.4',
        t: 'Nivel Alto — consumo de sustancias en actividades',
        d: 'Consumir alcohol y/o sustancias psicoactivas durante las actividades del club, a excepción de actividades recreativas expresamente autorizadas por los líderes.',
      },
      {
        n: '4.1.5',
        t: 'Nivel Alto — acoso y faltas de respeto graves',
        d: 'Conductas irrespetuosas, ofensivas, amenazantes o de acoso hacia el club, sus miembros, líderes o aspirantes, tanto en el plano físico como verbal.',
      },
      {
        n: '4.1.6',
        t: 'Nivel Alto — participación en actividades ilegales',
        d: 'Asistir con prendas, calca o distintivos del club a actividades de carácter ilegal (piques ilegales, actos delictivos u otros).',
      },
      {
        n: '4.2.1',
        t: 'Nivel Medio — documentación vencida o incompleta',
        d: 'Conducir con documentación de tránsito vencida o incompleta durante actividades oficiales del club.',
      },
      {
        n: '4.2.2',
        t: 'Nivel Medio — falta grave de respeto',
        d: 'Conducta irrespetuosa u ofensiva hacia otros miembros, líderes o aspirantes del club.',
      },
      {
        n: '4.2.3',
        t: 'Nivel Medio — desobediencia reiterada a líderes',
        d: 'Ignorar de manera reiterada y grave las instrucciones impartidas por los líderes y el grupo de ruta durante las actividades.',
      },
      {
        n: '4.3.1',
        t: 'Nivel Bajo — incumplimiento de pago de mensualidades',
        d: 'No contribuir con las mensualidades estipuladas por al menos tres (3) meses consecutivos sin justificación válida.',
      },
      {
        n: '4.3.2',
        t: 'Nivel Bajo — incumplimiento del período de prueba',
        d: 'Aspirantes ascendidos que no cumplan satisfactoriamente con las responsabilidades y obligaciones del Piloto Oficial durante los tres (3) meses del período de prueba serán descendidos a su categoría anterior.',
      },
      {
        n: 'Nota 1',
        t: 'Evaluación individualizada',
        d: 'Las faltas descritas están diseñadas para asegurar un ambiente seguro, respetuoso y solidario dentro del Club Raider Atlántico. Cada caso será evaluado de forma individualizada, considerando la gravedad de la falta y su impacto en la integridad del club. Los líderes se reservan el derecho de aplicar sanciones adicionales según las circunstancias específicas.',
      },
      {
        n: 'Nota 2',
        t: 'Reiteración de faltas',
        d: 'La reiteración en faltas de gravedad media o baja conllevará automáticamente la aplicación de la sanción de nivel alto.',
      },
      {
        n: 'Nota 3',
        t: 'Veto definitivo',
        d: 'En caso de retiro por faltas graves, el integrante perderá todo derecho de participación en las actividades del club, aplicándose un veto definitivo.',
      },
    ],
  },
  {
    id: 'titulo-5',
    n: '5',
    t: 'Principios y normas generales',
    items: [
      {
        n: '5.1',
        t: 'Seguridad vial',
        d: 'La seguridad vial es la prioridad absoluta en todas y cada una de las actividades del club.',
      },
      {
        n: '5.2',
        t: 'Respeto mutuo',
        d: 'El respeto mutuo constituye la base fundamental de la convivencia en el Club Raider.',
      },
      {
        n: '5.3',
        t: 'Participación constante',
        d: 'La participación constante es obligatoria para mantener el estatus de miembro.',
      },
      {
        n: '5.4',
        t: 'Unión, lealtad y solidaridad',
        d: 'Se promueve activamente la unión, la lealtad y la solidaridad; la división no tiene cabida en el club.',
      },
      {
        n: '5.5',
        t: 'Embajadores del club',
        d: 'Cada miembro es embajador del club en todo momento y contexto, dentro y fuera de las actividades.',
      },
      {
        n: '5.6',
        t: 'Veto permanente por faltas graves',
        d: 'El personal que sea retirado del grupo por faltas graves quedará vetado de manera permanente y no podrá participar en ninguna actividad del club.',
      },
    ],
  },
];
