const input = document.getElementById("input");
const salida = document.getElementById("salida");

input.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const result = await window.mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        //con esto mapeo las negritas y cursivas
        "b => strong",
        "i => i",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => i",

        // mapeeo headings y titulos
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Título 1'] => h1:fresh",
        "p[style-name='Título 2'] => h2:fresh",
        "p[style-name='Título 3'] => h3:fresh",

        // mapo los p
        "p[style-name='Normal'] => p:fresh"
      ],
      includeDefaultStyleMap: true
    }
  );

  let html = result.value || "";

  // normalizar variantes
  html = html
    .replace(/<\s*b(\s|>)/gi, "<strong$1")
    .replace(/<\s*\/\s*b\s*>/gi, "</strong>")
    .replace(/<\s*em(\s|>)/gi, "<i$1")
    .replace(/<\s*\/\s*em\s*>/gi, "</i>");

  // strongs e i para mostrarlo como texto
  html = html
    .replace(/<strong>/gi, "[[STRONG]]")
    .replace(/<\/strong>/gi, "[[/STRONG]]")
    .replace(/<i>/gi, "[[I]]")
    .replace(/<\/i>/gi, "[[/I]]");

  // saltos de linea en los encabezados
  html = html
    .replace(/<\/h2>/gi, "</h2><br>")
    .replace(/<\/h3>/gi, "</h3><br>")
    .replace(/<\/p>/gi, "</p><br>");

  // Convierte saltos de línea de texto a <br>
  html = html.replace(/\r\n/g, "\n").replace(/\n/g, "<br>");
  
  //Lo que se quite de aqui desaparece del renderizado
  html = html.replace(
    /<\/?(?!p|br|table|thead|tbody|tfoot|tr|th|td|caption)[^>]+>/gi,
    ""
  );

  // texto literal de etiquetas
  html = html
    .replace(/\[\[STRONG\]\]/g, "&lt;strong&gt;")
    .replace(/\[\[\/STRONG\]\]/g, "&lt;/strong&gt;")
    .replace(/\[\[I\]\]/g, "&lt;i&gt;")
    .replace(/\[\[\/I\]\]/g, "&lt;/i&gt;");

  //Renderiza en el front
  salida.innerHTML = html;
});
