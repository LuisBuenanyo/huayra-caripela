var app = angular.module('app');

var sel_Rect = undefined;



/*
 * Previene el bug clásico que no nos permitía seleccionar objetos
 * que se solapaban.
 */
fabric.util.object.extend(fabric.Canvas.prototype, {
  _searchPossibleTargets: function(e) {

    var target,
    pointer = this.getPointer(e);

    var i = this._objects.length;

    while(i--) {
      if (this._checkTarget(e, this._objects[i], pointer)){
        this.relatedTarget = this._objects[i];
        target = this._objects[i];
        break;
      }
    }

    return target;
  }
});


app.factory("Canvas", function() {
  var Canvas = {}

  Canvas.canvas = new fabric.Canvas('canvas');
  fabric.Object.prototype.transparentCorners = false;

  function informar_error(error) {
    if (error)
      alert(error);
  }

  Canvas.definir_imagen_de_fondo = function(ruta) {
    var c = Canvas.canvas;
    c.setBackgroundImage(ruta, c.renderAll.bind(c));
  }

  Canvas.guardar_como_archivo_svg = function(ruta) {
      var data = Canvas.canvas.toSVG();

      fs.writeFile(ruta, data, 'utf-8', informar_error);
  }

  Canvas.guardar_como_archivo_png = function(ruta) {
    var data = Canvas.canvas.toDataURL({format: 'png'});
    var base64Data = data.replace(/^data:image\/png;base64,/, "");

    fs.writeFile(ruta, base64Data, 'base64', informar_error);
  }

  Canvas.definir_fondo = function(ruta, preferencias) {
    var canvas = Canvas.canvas;
    canvas.setBackgroundImage(ruta, canvas.renderAll.bind(canvas));
  }

  Canvas.agregar_imagen = function(ruta, preferencias) {
    var canvas = Canvas.canvas;
    canvas.controlsAboveOverlay = true;
    var group = [];

    fabric.Image.fromURL(ruta, function(img) {

      var size = img.getOriginalSize();
      var ratio_horizontal = preferencias.ancho / size.width;
      var ratio_vertical = preferencias.alto / size.height;
      var ratio = Math.min(ratio_horizontal, ratio_vertical);

      //img.scale(ratio);

      //img.perPixelTargetFind = true;
      //img.targetFindTolerance = 10;

      // Extrae el nombre del directorio de donde salió la imagen, por
      // ejemplo si el path es 'partes/cara/1.svg', la variable categoría
      // va a quedar con el valor 'cara'.
      //
      // Esta categoría se guarda en el objeto, para evitar que el avatar
      // tenga mas de una cara, mas de dos bocas etc...
      var categoria = ruta.match(/partes\/(\w+)\//)[1];


      canvas.forEachObject(function(o, i) {
        if (o.categoria == categoria) {
          preferencias.x = o.left;
          preferencias.y = o.top;
          canvas.remove(o);
        }
      });

      img.set({
        left: preferencias.x,
        top: preferencias.y,
        scaleX: ratio,
        scaleY: ratio,
        categoria: categoria,
        z: preferencias.z
      });


      // Tinte de color !
      //var filter = new fabric.Image.filters.Tint({
      //	color: '#3513B0',
        //color: 'rgba(53, 21, 176, 0.5)'
      //	opacity: 0.5
      //});

      //img.filters.push(filter);
      //img.applyFilters(Canvas.canvas.renderAll.bind(Canvas.canvas));


      Canvas.canvas.add(img);

      // ordena todos los objetos por valor Z.
      canvas.forEachObject(function(o, i) {
        Canvas.canvas.moveTo(o, -o.z);
      });

    });
  }

  return Canvas;
});