const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path');


require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
});

let win;

function createWindow() {
  // Crea la ventana del navegador.
  win = new BrowserWindow({
    width: 1300,
    height: 750,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('./src/index.html')
  win.webContents.on('did-finish-load', () => {
    getAllProducts()
      .then(products => {
        win.webContents.send('products', products);
      });
  })
}


app.on('ready', () => {
  createWindow()
  mainMenu = new Menu.buildFromTemplate(templateMenu)
  Menu.setApplicationMenu(mainMenu)

  ipcMain.on('id_product', (evento, idProduct) => {
    getProductId(idProduct).then(product => {
      win.webContents.send('product', product)
      console.log('enviando esta vaina loca')
      console.log(product)
    })
  })
  ipcMain.on('idCliente', (evento, idCliente) => {
    getClient(idCliente).then(cliente => {
      win.webContents.send('cliente', cliente)
      //console.log(cliente)
    })
  })
})

// Menu Template
const templateMenu = [
  {
    label: 'Printer',
    submenu: [
      {
        label: 'Impresoras',
        accelerator: 'Ctrl+N',
        click() {
          printerESCPOS();
        }
      },
      {
        label: 'listar Impreosras',
        accelerator: 'Ctrl+L',
        click() {
          findPrinters();
        }
      },
      {
        label: 'DATOS',
        accelerator: 'Ctrl+D',
        click() {
          getAllProducts().then(products => {
            console.log(products)
          })
        }
      }
    ]
  },
  {
    label: 'DevTools',
    submenu: [
      {
        label: 'Show/Hide Dev Tools',
        accelerator: 'F12',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },

      },
      {
        label: 'Refresh',
        accelerator: 'Ctrl+R',
        accelerator: 'F5'
      }
    ]
  }
];

const getAllProducts = () => {
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database('pos');

  return new Promise((resolve, reject) => {
    db.serialize(function () {
      db.run("CREATE TABLE IF NOT EXISTS productos (codigo TEXT, nombre TEXT, descripcion TEXT)");
      db.run("CREATE TABLE IF NOT EXISTS precios (tipo_precio TEXT, valor FLOAT, valor_iva FLOAT, id_prod INTEGER, FOREIGN KEY(id_prod) REFERENCES productos (codigo))");
      db.run("CREATE TABLE IF NOT EXISTS stock (id_stock INTEGER, bodega TEXT, qty REAL, id_prod INTEGER, FOREIGN KEY(id_prod) REFERENCES productos (codigo))");
      db.run("CREATE TABLE IF NOT EXISTS impuestos (tax_type	INTEGER, valor	INTEGER, id_prod	INTEGER, FOREIGN KEY(id_prod) REFERENCES productos(codigo))")
      db.run(`CREATE TABLE IF NOT EXISTS clientes ( 
              tax_id TEXT NOT NULL, 
              customer_name TEXT NOT NULL, 
              type_document TEXT, 
              direccion_fact TEXT, 
              telefono_fact TEXT, 
              email_fact TEXT, 
              PRIMARY KEY(tax_id))`);
    });
    db.all(`SELECT pro.rowid, pro.codigo, pro.descripcion, pre.valor, pre.valor_iva 
            FROM productos pro 
            LEFT JOIN precios pre ON pro.codigo = pre.id_prod 
            AND pre.tipo_precio = "p_a" 
            limit 20` ,
      function (err, rows) {
        resolve(rows)
      });
  })
}

const getProductId = (idProduct) => {
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database('pos');
  // send to the Main Window
  console.log('========Probando esta vaina loca==============')
  console.log(idProduct);
  return new Promise((resolve, reject) => {
    db.all(`SELECT pro.rowid, pro.codigo, pro.descripcion, pre.valor, pre.valor_iva 
            FROM productos pro LEFT JOIN precios pre 
            ON pro.codigo = pre.id_prod 
            AND pre.tipo_precio = "p_a" 
            WHERE pro.codigo LIKE '%${idProduct}%' OR nombre LIKE '%${idProduct}%' OR descripcion LIKE '%${idProduct}%'`,
      function (err, row) {
        console.log(row)
        resolve(row)
      });
  })
};

const getClient = (client) => {
  var sqlite3 = require('sqlite3').verbose();
  var db = new sqlite3.Database('pos');
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM clientes WHERE customer_name LIKE '%${client}%' OR tax_id LIKE '%${client}%' `, function (err, row) {
      console.log(row);
      resolve(row)
    });
  })
};



