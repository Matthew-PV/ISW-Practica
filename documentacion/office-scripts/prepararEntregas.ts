/**
 * «Preparar entregas» — Office Script de un solo uso del Excel de customer stories (Customer_Stories_PlanB.xlsx).
 *
 * Prepara el libro para llevar el tiempo de cada persona por entrega:
 *   1. crea la hoja «Tiempos», detrás del Índice, con la tabla «Entregas» (E1, E2, E3…, en orden y sin fechas)
 *      y las horas de cada persona en cada entrega, calculadas con fórmulas;
 *   2. añade al Índice la columna «Entrega», con desplegable, y asigna la entrega de las historias ya trabajadas;
 *   3. añade la guía de macrotareas a la ayuda (A14) de «Plantilla» y de cada página.
 * Se puede ejecutar más de una vez: lo que ya existe no se duplica ni se sobrescribe.
 *
 * Uso: Automatizar → Nuevo script → pegar este archivo → Ejecutar.
 */

// Entregas en orden. Para añadir una más adelante basta con escribir otra fila en la tabla «Entregas».
const ENTREGAS: string[][] = [
  ["E1", "Acceso y perfil"],
  ["E2", "Círculo social"],
  ["E3", "Parte visual y BBDD online"],
];

// Entrega de las historias ya trabajadas, según la fecha de sus commits (E1 hasta el 02/10, E2 hasta el 09/10).
const ASIGNACION: { [ref: string]: string } = {
  "CS-47": "E1", "CS-49": "E1", "CS-57": "E1", "CS-59": "E1", "CS-60": "E1",
  "CS-01": "E2", "CS-22": "E2", "CS-30": "E2", "CS-44": "E2", "CS-45": "E2",
  "CS-48": "E2", "CS-61": "E2", "CS-62": "E2", "CS-63": "E2", "CS-64": "E2",
};

// Columnas de entrega que caben en las horas por persona (de la E a la N de «Tiempos»).
const COLUMNAS_ENTREGA = 10;

// Texto que se añade a la ayuda de cada página (ver metodologia.md §3.4).
const GUIA = " Los objetivos son macrotareas: entre 3 y 6 por historia, cada uno con un resultado comprobable de 1 a 4 horas que incluye sus pruebas; nunca uno por capa, archivo o paso de TDD.";

function main(workbook: ExcelScript.Workbook) {
  const tabla = workbook.getTable("Historias");
  const plantilla = workbook.getWorksheet("Plantilla");
  if (!tabla || !plantilla) {
    throw new Error("No se encuentra la tabla «Historias» o la hoja «Plantilla».");
  }
  const indice = tabla.getWorksheet();

  // El orden importa: las fórmulas de «Tiempos» usan la tabla «Entregas» y la columna «Entrega» del Índice.
  const hoja = crearHojaTiempos(workbook, indice);
  anadirColumnaEntrega(indice, tabla);
  if (hoja) {
    escribirHorasPorPersona(hoja, indice, tabla, leerEquipo(plantilla));
  }
  anadirGuia(workbook);
  console.log("Entregas preparadas.");
}

// Lee el equipo del desplegable «Responsable» de la plantilla, para no repetir la lista aquí.
function leerEquipo(plantilla: ExcelScript.Worksheet): string[] {
  const regla = plantilla.getTables()[0].getColumnByName("Responsable")
    .getRangeBetweenHeaderAndTotal().getDataValidation().getRule();
  return (regla.list ? regla.list.source : "").replace(/"/g, "").split(",").map((nombre) => nombre.trim());
}

// Crea la hoja «Tiempos» con su título y la tabla «Entregas». Devuelve undefined si ya existía.
function crearHojaTiempos(workbook: ExcelScript.Workbook, indice: ExcelScript.Worksheet): ExcelScript.Worksheet | undefined {
  if (workbook.getWorksheet("Tiempos")) {
    return undefined;
  }
  const hoja = workbook.addWorksheet("Tiempos");
  hoja.setPosition(indice.getPosition() + 1);
  hoja.getRange("A1:O30").getFormat().getFont().setName("Arial");

  hoja.getRange("A1").setValue("Tiempos por entrega");
  hoja.getRange("A1").copyFrom(indice.getRange("A1"), ExcelScript.RangeCopyType.formats);
  hoja.getRange("A2").setValue("Escribe una fila nueva en la tabla «Entregas» para añadir una entrega. Las horas de cada persona suman el Tiempo total de los objetivos que tiene como responsable en las historias de esa entrega (columna «Entrega» del Índice). «Otros» recoge a quien no está en la lista del equipo.");
  hoja.getRange("A2").copyFrom(indice.getRange("A2"), ExcelScript.RangeCopyType.formats);
  hoja.getRange("A2").getFormat().setWrapText(false);

  const filas = [["Entrega", "Nombre"]].concat(ENTREGAS);
  const rango = hoja.getRange("A4").getResizedRange(filas.length - 1, 1);
  rango.setValues(filas);
  const entregas = hoja.addTable(rango.getAddress(), true);
  entregas.setName("Entregas");
  entregas.setPredefinedTableStyle(workbook.getTable("Historias").getPredefinedTableStyle());
  hoja.getRange("A4:B4").copyFrom(indice.getRange("A3:B3"), ExcelScript.RangeCopyType.formats);

  hoja.getRange("A:A").getFormat().setColumnWidth(80);
  hoja.getRange("B:B").getFormat().setColumnWidth(170);
  hoja.getRange("C:C").getFormat().setColumnWidth(20);
  return hoja;
}

// Añade al Índice la columna «Entrega» con su desplegable y asigna la entrega de las historias ya trabajadas.
function anadirColumnaEntrega(indice: ExcelScript.Worksheet, tabla: ExcelScript.Table) {
  if (!tabla.getColumnByName("Entrega")) {
    tabla.addColumn(tabla.getColumns().length, undefined, "Entrega");
  }
  const columna = tabla.getColumnByName("Entrega");
  const datos = columna.getRangeBetweenHeaderAndTotal();
  const letra = String.fromCharCode(65 + datos.getColumnIndex());

  // Mismo aspecto que Prioridad (otra columna con desplegable) y desplegable hasta la fila 500, como el resto.
  columna.getHeaderRowRange().copyFrom(tabla.getColumnByName("Prioridad").getHeaderRowRange(), ExcelScript.RangeCopyType.formats);
  indice.getRange(`${letra}4:${letra}500`).copyFrom(indice.getRange("D4:D500"), ExcelScript.RangeCopyType.formats);
  indice.getRange(`${letra}4:${letra}500`).getDataValidation().setRule({
    list: { inCellDropDown: true, source: '=INDIRECT("Entregas[Entrega]")' },
  });
  indice.getRange(`${letra}:${letra}`).getFormat().setColumnWidth(70);

  // Solo se rellenan las celdas vacías: una entrega ya elegida a mano no se toca.
  const refs = tabla.getColumnByName("Ref").getRangeBetweenHeaderAndTotal().getValues();
  const actuales = datos.getValues();
  for (let i = 0; i < refs.length; i++) {
    const entrega = ASIGNACION[String(refs[i][0]).trim()];
    if (entrega && String(actuales[i][0]).trim() === "") {
      datos.getCell(i, 0).setValue(entrega);
    }
  }
}

// Escribe en «Tiempos» las horas de cada persona por entrega (filas) con las entregas en columnas.
function escribirHorasPorPersona(hoja: ExcelScript.Worksheet, indice: ExcelScript.Worksheet, tabla: ExcelScript.Table, equipo: string[]) {
  const ultima = String.fromCharCode(68 + COLUMNAS_ENTREGA);   // N con 10 entregas
  const total = String.fromCharCode(69 + COLUMNAS_ENTREGA);    // O
  const filaOtros = 5 + equipo.length;
  const filaTotal = filaOtros + 1;

  hoja.getRange("D4").setValue("Persona");
  hoja.getRange(`${total}4`).setValue("Total");
  equipo.forEach((nombre, i) => hoja.getRange(`D${5 + i}`).setValue(nombre));
  hoja.getRange(`D${filaOtros}`).setValue("Otros");
  hoja.getRange(`D${filaTotal}`).setValue("Total");

  for (let j = 0; j < COLUMNAS_ENTREGA; j++) {
    const c = String.fromCharCode(69 + j);
    // Cabecera: la entrega número j+1 de la tabla, o vacía si todavía no existe.
    hoja.getRange(`${c}4`).setFormula(`=IFERROR(INDEX(Entregas[Entrega],${j + 1}),"")`);
    for (let fila = 5; fila < filaOtros; fila++) {
      // Páginas de las historias de esa entrega → suma de Tiempo total (F) de los objetivos (A>0) cuyo Responsable (D) es la persona.
      hoja.getRange(`${c}${fila}`).setFormula(
        `=IF(${c}$4="","",LET(refs,FILTER(Historias[Ref],(Historias[Entrega]=${c}$4)*(Historias[Estado]<>"Sin página"),""),` +
        `IFERROR(SUMPRODUCT(SUMIFS(INDIRECT("'"&refs&"'!F:F"),INDIRECT("'"&refs&"'!D:D"),$D${fila},INDIRECT("'"&refs&"'!A:A"),">0"))/60,0)))`);
    }
    // Otros: lo que no es de nadie del equipo (responsable vacío o con otro nombre). ROUND evita un «-0,0» por los decimales.
    hoja.getRange(`${c}${filaOtros}`).setFormula(`=IF(${c}$4="","",ROUND(${c}${filaTotal}-SUM(${c}5:${c}${filaOtros - 1}),4))`);
    // Total: el mismo Tiempo total que muestra el Índice para las historias de esa entrega.
    hoja.getRange(`${c}${filaTotal}`).setFormula(`=IF(${c}$4="","",SUMIFS(Historias[Tiempo total],Historias[Entrega],${c}$4))`);
  }
  for (let fila = 5; fila <= filaTotal; fila++) {
    hoja.getRange(`${total}${fila}`).setFormula(`=SUM(E${fila}:${ultima}${fila})`);
  }

  // Formato: cabecera como la del Índice, horas como en el Índice («1,5 h», y «—» para el cero), totales en negrita.
  const cabecera = hoja.getRange(`D4:${total}4`);
  cabecera.copyFrom(indice.getRange("G3"), ExcelScript.RangeCopyType.formats);
  const horas = hoja.getRange(`E5:${total}${filaTotal}`);
  horas.setNumberFormat(tabla.getColumnByName("Tiempo total").getRangeBetweenHeaderAndTotal().getCell(0, 0).getNumberFormat());
  horas.getFormat().setHorizontalAlignment(ExcelScript.HorizontalAlignment.center);
  hoja.getRange(`D${filaTotal}:${total}${filaTotal}`).getFormat().getFont().setBold(true);
  hoja.getRange(`${total}5:${total}${filaTotal}`).getFormat().getFont().setBold(true);
  const matriz = hoja.getRange(`D4:${total}${filaTotal}`);
  [ExcelScript.BorderIndex.edgeTop, ExcelScript.BorderIndex.edgeBottom, ExcelScript.BorderIndex.edgeLeft,
    ExcelScript.BorderIndex.edgeRight, ExcelScript.BorderIndex.insideHorizontal, ExcelScript.BorderIndex.insideVertical]
    .forEach((borde) => {
      const linea = matriz.getFormat().getRangeBorder(borde);
      linea.setStyle(ExcelScript.BorderLineStyle.continuous);
      linea.setColor("#A6A6A6");
    });
  hoja.getRange("D:D").getFormat().setColumnWidth(80);
  hoja.getRange(`E:${total}`).getFormat().setColumnWidth(55);
}

// Añade la guía de macrotareas a la ayuda (A14) de «Plantilla» y de las páginas que conservan la ayuda original.
function anadirGuia(workbook: ExcelScript.Workbook) {
  for (const hoja of workbook.getWorksheets()) {
    const nombre = hoja.getName();
    if (nombre !== "Plantilla" && !/^CS-\d+$/.test(nombre)) {
      continue;
    }
    const celda = hoja.getRange("A14");
    const ayuda = String(celda.getValue());
    if (ayuda.startsWith("Las celdas grises") && !ayuda.includes("macrotareas")) {
      celda.setValue(ayuda + GUIA);
      celda.getFormat().setRowHeight(celda.getFormat().getRowHeight() + 15);
    }
  }
}
