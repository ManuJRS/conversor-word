document.addEventListener('DOMContentLoaded', () => {
  const input  = document.getElementById("input");
  const salida = document.getElementById("salida");

  if (!input || !salida) {
    console.error("Falta #input o #salida en el DOM");
    return;
  }
  if (!window.mammoth) {
    console.error("Mammoth no está cargado");
    return;
  }
  if (!window.DOMPurify) {
    console.warn("DOMPurify no está cargado. Se imprimirá sin sanitizar.");
  }

  input.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.convertToHtml(
      { arrayBuffer },
      {
        styleMap: [
          "b => strong",
          "i => i",
          "r[style-name='Strong'] => strong",
          "r[style-name='Emphasis'] => i",

          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Título 1'] => h1:fresh",
          "p[style-name='Título 2'] => h2:fresh",
          "p[style-name='Título 3'] => h3:fresh",

          "p[style-name='Normal'] => p:fresh"
        ],
        includeDefaultStyleMap: true
      }
    );

    let html = result.value || "";

    html = html
      .replace(/<\s*b(\s|>)/gi, "<strong$1")
      .replace(/<\s*\/\s*b\s*>/gi, "</strong>")
      .replace(/<\s*em(\s|>)/gi, "<i$1")
      .replace(/<\s*\/\s*em\s*>/gi, "</i>");

    html = html
      .replace(/<strong>/gi, "[[STRONG]]")
      .replace(/<\/strong>/gi, "[[/STRONG]]")
      .replace(/<i>/gi, "[[I]]")
      .replace(/<\/i>/gi, "[[/I]]");

    html = html
      .replace(/\[\[STRONG\]\]/g, "&lt;strong&gt;")
      .replace(/\[\[\/STRONG\]\]/g, "&lt;/strong&gt;")
      .replace(/\[\[I\]\]/g, "&lt;i&gt;")
      .replace(/\[\[\/I\]\]/g, "&lt;/i&gt;");

    const clean = window.DOMPurify
      ? DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            'p','br','h1','h2','h3',
            'table','thead','tbody','tfoot','tr','th','td','caption',
            'ul','ol','li','a','span','img'
          ],
          ALLOWED_ATTR: ['rowspan','colspan','scope','href','src','alt']
        })
      : html;

    const container = document.createElement('div');
    container.innerHTML = clean;

    container.querySelectorAll('td > table:only-child').forEach(inner => {
      const td = inner.parentElement;
      const outer = td.closest('table');
      if (outer) {
        outer.insertAdjacentElement('afterend', inner);
        if (!td.textContent.trim() && td.children.length === 0) {
          const tr = td.parentElement;
          td.remove();
          if (tr && tr.children.length === 0) tr.remove();
        }
      }
    });

    salida.innerHTML = container.innerHTML;

    if (!salida.innerText.trim()) {
      console.warn("El HTML resultante está vacío. Revisa el DOCX o las etiquetas permitidas.");
    }
  });
});