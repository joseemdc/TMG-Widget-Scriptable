// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: magic;
/*
 MIT License

 Copyright (c) 2025 Jose Manuel Delgado Chapela
 Sólo funciona con la app Scriptable en iOS.
 El script muestra el saldo de la tarjeta TMG en un widget.
 Requiere tener un archivo JSON con el saldo y los trayectos en iCloud Drive.
*/
let items = await loadItems()
class Pill {
  constructor(tipo, saldo, nombre, precio, stack) {
    let pill = stack.addStack();
    pill.centerAlignContent()
    pill.cornerRadius = 15;
    pill.setPadding(2, 5, 2, 5);
    let gray = new Color("#DEDEDE", 1);
    let sym;
    switch (tipo) {
      case "bus":
        sym = SFSymbol.named("bus.fill");
        break;
      case "barco":
        sym = SFSymbol.named("ferry.fill");
        break;
      case "tren":
        sym = SFSymbol.named("train.side.front.car");
        break;
    }
    let icon = pill.addImage(sym.image);
    //     icon.resizable=false;
    icon.tintColor = gray;
    icon.imageSize = new Size(20, 20)
    pill.addSpacer(2)
    let viajesRestantes = Math.trunc(saldo / precio);
    let label = pill.addText(nombre + " " + viajesRestantes.toString());
    label.textColor = gray;
    label.font = Font.boldMonospacedSystemFont(15);
    if (viajesRestantes > 0) {
      pill.backgroundColor = new Color("#00FF1E", 0.5);
    } else {
      pill.backgroundColor = new Color("#FF0000", 0.5);
    }
  }

}
if (config.runsInWidget) {
  // Tell the widget on the Home Screen to show our ListWidget instance.
  let widget = await createWidget(items)
  Script.setWidget(widget)
} else if (config.runsWithSiri) {
  // Present a table with a subset of the news.
  //let firstItems = items.slice(0, 5)
  let widget = await createWidget(items)
  Script.setWidget(widget)
  //let table = createTable(firstItems)
  //await QuickLook.present(table)
} else {
  // Present the full list of news.
  //let table = createTable(items)
  //   await QuickLook.present(table)
}
// Calling Script.complete() signals to Scriptable that the script have finished running.
// This can speed up the execution, in particular when running the script from Shortcuts or using Siri.
Script.complete()

async function createWidget(items) {

  let red = new Color("#FF0000", 0.5);
  const isDark = Device.isUsingDarkAppearance();

  let gradient = new LinearGradient();
  if (isDark) {
    gradient.colors = [
      new Color("#2C2C2C"),
      new Color("#0A0A0A")
    ]
    gradient.locations = [0.0, 1.0];
  }
  let widget = new ListWidget();
  widget.backgroundGradient = gradient;

  let img = items.get("imagen");
  let datos = items.get("datos");

  widget.setPadding(20, 20, 20, 20);





  //     widget.backgroundImage = img;
  //     widget.addImage(img);
  //     let stack = new WidgetStack();
  let stack = widget.addStack();

  //Columna izquierda del widget
  let verticalLayout1 = stack.addStack();
  verticalLayout1.layoutVertically();
  //Titulo del widget
  let titulo = verticalLayout1.addText("TMG");
  titulo.font = Font.boldSystemFont(15);

  verticalLayout1.addSpacer();
  //Imagen del widget
  let imgStacked = verticalLayout1.addImage(img);
  imgStacked.imageSize = new Size(320 * 0.5, Math.round((img.size.height / img.size.width) * 320 * 0.5));
  imgStacked.centerAlignImage();
  imgStacked.cornerRadius = 10;
  verticalLayout1.addSpacer();
  stack.addSpacer(10);

  //Columna derecha del widget
  let verticalLayout2 = stack.addStack();
  verticalLayout2.layoutVertically();
  let saldoLabel = verticalLayout2.addText("SALDO");
  saldoLabel.leftAlignText();
  saldoLabel.minimumScaleFactor = 1;
  saldoLabel.font = Font.boldSystemFont(12);
  verticalLayout2.addSpacer(10);

  let hLayout = verticalLayout2.addStack();
  hLayout.addSpacer();
  let saldo = hLayout.addText(datos.saldo.toString().replace('.', ',') + "€");
  hLayout.addSpacer();
  saldo.centerAlignText();
  saldo.font = Font.heavyRoundedSystemFont(30);
  verticalLayout2.addSpacer(10);

  let viajesLabel = verticalLayout2.addText("VIAJES DISPONIBLES");
  viajesLabel.leftAlignText();
  viajesLabel.minimumScaleFactor = 1;
  viajesLabel.font = Font.boldSystemFont(12);

  verticalLayout2.addSpacer(10);
  Object.entries(datos.trayectos).forEach(([nombre, trayecto]) => {
    let pill = new Pill(trayecto.tipo, datos.saldo, nombre, trayecto.precio, verticalLayout2);
    verticalLayout2.addSpacer(5)
  })


  //   widget.backgroundColor = new Color("#b00a0f")
  //   widget.backgroundGradient = gradient
 
  stack.addSpacer();
  //    widget.addSpacer()

  

  // Set URL to open when tapping widget.

  return widget;
}


function createTable(items) {
  let table = new UITable()
  for (item of items) {
    let row = new UITableRow()
    let imageURL = extractImageURL(item)
    let title = decode(item.title)
    let imageCell = row.addImageAtURL(imageURL)
    let titleCell = row.addText(title)
    imageCell.widthWeight = 20
    titleCell.widthWeight = 80
    row.height = 60
    row.cellSpacing = 10
    row.onSelect = (idx) => {
      let item = items[idx]
      Safari.open(item.url)
    }
    row.dismissOnSelect = false
    table.addRow(row)
  }
  return table
}

async function loadItems() {
  let items = new Map();
  let fmLocal = FileManager.local();
  let fm = FileManager.iCloud();
  let path = fm.joinPath(fm.documentsDirectory(), "TMG.PNG");
  let JsonPath = fmLocal.bookmarkedPath("tmg.json");
  let datos = JSON.parse(fmLocal.readString(JsonPath));
  await fm.downloadFileFromiCloud(path);
  let img = fm.readImage(path);
  items.set("imagen", img);
  items.set("datos", datos);
  return items;
}
