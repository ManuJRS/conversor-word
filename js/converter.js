    const input = document.getElementById("input");
    const salida = document.getElementById("salida");

    input.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const arrayBuffer = await file.arrayBuffer();

      // 1️⃣ Convertimos a HTML simple
      const result = await window.mammoth.convertToHtml(
        { arrayBuffer },
        {
            //Aqui mapeamos otras etiquetas
          styleMap: [
            "b => strong",
            "i => i",
            "r[style-name='Strong'] => strong",
            "r[style-name='Emphasis'] => i"
          ],
          includeDefaultStyleMap: true
        }
      );

      let html = result.value || "";

      //Aqui agregamos otras etiquetas
      let text = html
        .replace(/<strong>/gi, "[[STRONG]]")
        .replace(/<\/strong>/gi, "[[/STRONG]]")
        .replace(/<i>/gi, "[[I]]")
        .replace(/<\/i>/gi, "[[/I]]")
        //con esto reemplazxo <br> por un salto de lineea real 
        .replace(/<br\s*\/?>/gi, "\n")
        //si mammoth une parrafos consecutivos inserta un salto entre ellos
        .replace(/<\/p>\s*<p>/gi, "\n")
        // elimina los <p> restantes
        .replace(/<\/?p[^>]*>/gi, "")
        // Quita lo demas 
        .replace(/<\/?[^>]+>/g, "")
        // restaura strong/i
        .replace(/\[\[STRONG\]\]/g, "<strong>")
        .replace(/\[\[\/STRONG\]\]/g, "</strong>")
        .replace(/\[\[I\]\]/g, "<i>")
        .replace(/\[\[\/I\]\]/g, "</i>")
        // normaliza CRLF → LF
        .replace(/\r\n/g, "\n");
        //Con esto pude aumentar el espacio de los saltos de linea, pero creo que seria mejor hacerlo con css 
        text = text.replace(/\n/g, "\n\n");


        salida.style.whiteSpace = "pre-wrap";
        salida.textContent = text;
    });
