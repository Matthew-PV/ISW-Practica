/**
 * «Crear páginas» — Office Script del Excel de customer stories (Customer_Stories_PlanB.xlsx).
 *
 * Recorre la tabla «Historias» del Índice y, para cada fila que tenga título:
 *   1. si no tiene referencia, le pone la siguiente libre (CS-61, CS-62...);
 *   2. si su página no existe, la crea copiando la hoja «Plantilla»,
 *      le escribe la referencia en B2 y la fecha de hoy en B10;
 *   3. enlaza el título del Índice con su página, y la página con el Índice («↑ Índice», en F1).
 * Como rehace todos los enlaces, también sirve para repararlos si dejan de funcionar
 * o si el texto de un enlace no coincide con el título.
 * Se puede ejecutar todas las veces que se quiera: lo que ya existe no se toca.
 *
 * Instalación (una sola vez, en Excel para la web, con el libro ya en OneDrive):
 *   Automatizar → Nuevo script → pegar este archivo → guardar como «Crear páginas».
 *   En el panel del script: «…» → «Agregar en el libro» (Add in workbook). Aparece un botón;
 *   colocarlo en el Índice, junto al título. Cualquiera con permiso de edición puede pulsarlo.
 */
function main(workbook: ExcelScript.Workbook) {
  const tabla = workbook.getTable("Historias");
  const plantilla = workbook.getWorksheet("Plantilla");
  if (!tabla || !plantilla) {
    throw new Error("No se encuentra la tabla «Historias» o la hoja «Plantilla».");
  }

  const columnaRef = tabla.getColumnByName("Ref");
  const columnaTitulo = tabla.getColumnByName("Título");
  if (!columnaRef || !columnaTitulo) {
    throw new Error("La tabla «Historias» necesita las columnas «Ref» y «Título».");
  }

  const celdasRef = columnaRef.getRangeBetweenHeaderAndTotal();
  const celdasTitulo = columnaTitulo.getRangeBetweenHeaderAndTotal();
  const refs = celdasRef.getValues();
  const titulos = celdasTitulo.getValues();

  // Número más alto ya usado, para seguir a partir de él aunque se haya borrado alguna story.
  let ultimo = 0;
  for (const [ref] of refs) {
    const numero = /^CS-(\d+)$/.exec(String(ref).trim());
    if (numero) {
      ultimo = Math.max(ultimo, Number(numero[1]));
    }
  }

  // Fecha de hoy como número de serie de Excel (días desde el 30/12/1899).
  const ahora = new Date();
  const hoy = (Date.UTC(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()) - Date.UTC(1899, 11, 30)) / 86400000;

  const creadas: ExcelScript.Worksheet[] = [];
  for (let i = 0; i < refs.length; i++) {
    const titulo = String(titulos[i][0]).trim();
    if (titulo === "") {
      continue;
    }

    let ref = String(refs[i][0]).trim();
    if (ref === "") {
      ultimo++;
      ref = "CS-" + String(ultimo).padStart(2, "0");
      celdasRef.getCell(i, 0).setValue(ref);
    }

    if (!workbook.getWorksheet(ref)) {
      // La copia se coloca delante de «Plantilla», que se queda siempre la última.
      const hoja = plantilla.copy(ExcelScript.WorksheetPositionType.before, plantilla);
      hoja.setName(ref);
      hoja.getRange("B2").setValue(ref);
      hoja.getRange("B10").setValue(hoy);
      hoja.getTables()[0].setName("Obj_" + ref.replace("-", ""));
      creadas.push(hoja);
    }

    celdasTitulo.getCell(i, 0).setHyperlink({
      documentReference: `'${ref}'!A1`,
      textToDisplay: titulo,
      screenTip: `Abrir ${ref}`,
    });
    enlazarIndice(workbook.getWorksheet(ref), tabla.getWorksheet().getName());
  }
  enlazarIndice(plantilla, tabla.getWorksheet().getName());

  // Con una sola página nueva se abre directamente para rellenarla.
  if (creadas.length === 1) {
    creadas[0].activate();
  }
  console.log(creadas.length > 0
    ? `Páginas creadas: ${creadas.map((hoja) => hoja.getName()).join(", ")}`
    : "No había páginas nuevas que crear.");
}

// Rehace el enlace «↑ Índice» (F1) de una página para volver al Índice.
function enlazarIndice(hoja: ExcelScript.Worksheet, indice: string) {
  hoja.getRange("F1").setHyperlink({
    documentReference: `'${indice}'!A1`,
    textToDisplay: "↑ Índice",
    screenTip: "Volver al índice",
  });
}
