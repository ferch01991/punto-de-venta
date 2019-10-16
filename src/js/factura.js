const { ipcRenderer } = require('electron')

var widgetHeader = {
    template: 'Header',
    type: 'header'
}

var widgetDetalleFactura = {
    view: "datatable",
    id: 'factura',
    width: 700,
    editable: true,
    columns: [
        //{ view:"button", id='del', value:"Add", click:addData}, 
        { id: "del", header: "", css: "webix_el_button", fillspace: 0.2, template: "<a href='javascript:void(0)' class='webix_icon mdi mdi-close-circle removeData' style='color:red'></a>" },
        { id: "cant", header: "cant".toUpperCase(), css: "header", fillspace: 0.5, footer: { text: "Total:", colspan: 3 } },
        { id: "descripcion", header: "descripcion".toUpperCase(), fillspace: 2 },
        { id: "desc", header: "desc. %".toUpperCase(), fillspace: 0.5 },
        { id: "subtotal", header: "subtotal".toUpperCase(), fillspace: 0.5 },
        // Se agrega la funcion MATH para hacer operaciones con las celdas, no es necesario agregar esta columna en la data
        { id: "total", header: "total".toUpperCase(), fillspace: 0.5, math: "[$r, cant] * [$r, subtotal]", footer: { content: "summColumn" } }
    ],
    data: [],
    math: true,
    footer: true,
    onClick: {
        'removeData': function (evento, columna, target) {
            $$('factura').remove(columna.row)
            subtotal = $$('factura').getFooterNode('total').textContent
            sub = (parseFloat(subtotal)).toFixed(2)
            iva = parseFloat((sub * 0.12).toFixed(2))
            console.log(typeof (sub))
            total = parseFloat(sub) + iva
            // Se carga los datos al formulario de con el ID valorfactura
            $$('valorFactura').setValues({
                subtotal: sub,
                desc: 0,
                sub0: 0,
                sub12: sub,
                iva: iva,
                total: total.toFixed(2)
            })
        }
    }
}

var widgetBuscadorCliente = {
    scroll: "y",
    view: 'form',
    id: 'formClienteBuscador',
    autoheight: true,
    elements: [
        {
            view: "toolbar", elements: [
                {
                    id: 'buscarCliente',
                    name: 'buscarCliente',
                    view: "search",
                    popup: "my_pop",
                    placeholder: 'Buscar cliente'
                }
            ]
        },
        {
            view: 'accordion',
            type: "wide",
            multi: true,
            rows: [{
                header: "Información del cliente",
                body: {
                    view: "form",
                    id: 'datos-cliente',
                    template: "#data0# (#data1#)",
                    elements: [
                        { id: 'nombre', name: 'nombre', view: "text", label: "Nombre" },
                        { id: 'ci_ruc', name: 'ci_ruc', view: "text", label: "CI/RUC" },
                        { id: 'direccion', name: 'direccion', view: "text", label: "Dirección" },
                        { id: 'telefono', name: 'telefono', view: "text", label: "Teléfono" },
                        { id: 'correo', name: 'correo', view: "text", label: "Correo" }
                    ]
                }
            }]
        }
    ]
}

var listProducts = {
    scroll: "y",
    view: 'form',
    id: 'formProducts',
    autoheight: true,
    elements: [
        {
            view: 'search',
            id: 'searchProduct',
            type: 'header',
            placeholder: 'Buscar Producto',
            //label: 'Buscar Producto',
            labelWidth: 130
        },
        {
            view: "datatable",
            id: "productos",
            columns: [
                { id: "id", header: "", css: "header", fillspace: 0.2 },
                { id: "codigo", header: "CODIGO", fillspace: 0.4 },
                { id: "descripcion", header: "DESCRIPCION", fillspace: 2 },
                { id: "valor_iva", header: "VALOR", width: 100, fillspace: 0.4 }
            ],
            select: true,
            data: [],
            pager: 'pagerA'
        },
        {
            view: "pager",
            id: "pagerA",
            animate: true,
            size: 5,
            //align:"right"
        }

    ]
}


var data_list_popup = new webix.DataCollection({
    data: []
});

var widgetBodega = {
    view: 'datatable',
    id: 'bodega',
    columns: [
        { id: 'r', header: '' },
        { id: 'bodega', header: 'BODEGA', fillspace: 0.5 },
        { id: 'stock', header: 'STOCK' }
    ],
    data: [
        { id: 1, bodega: "Bodega Medicos", stock: 1, r: 1 },
        { id: 2, bodega: "Bodega Loja", stock: 1, r: 2 }
    ]
}

var widgetPrecios = {
    view: 'datatable',
    id: 'precios',
    select: true,
    columns: [
        { id: 'r', header: '' },
        { id: 'bodega', header: 'TIPO', fillspace: 0.5 },
        { id: 'stock', header: 'VALOR' }
    ],
    data: [
        { id: 1, bodega: "Precio A", stock: 2.55, r: 1 },
        { id: 2, bodega: "Precio B", stock: 2.45, r: 2 }
    ]
}


webix.ready(function () {
    webix.ui({
        // width: 500,
        view: 'layout',
        type: 'space',
        responsive: true,
        rows: [
            // Header del punto de venta
            widgetHeader,
            {
                cols: [{
                    rows: [
                        // Detalle de la factura
                        { template: "<h3 style='text-align: center'>Detalle de la factura</h3>", height: 40 },
                        widgetDetalleFactura,
                        {
                            view: 'resizer'
                        },
                        {
                            rows: [widgetBuscadorCliente]
                        }
                    ]
                },
                {
                    view: 'resizer'
                },
                {
                    autoheight: true,
                    rows: [
                        { template: "<h3 style='text-align: center'>Listado de productos</h3>", height: 40 },
                        // Buscador de produsctos
                        listProducts,
                        {
                            view: 'resizer'
                        },
                        {
                            cols: [
                                {
                                    rows: [
                                        { template: "<h3 style='text-align: center'>Stock en Bodega</h3>", height: 40 },
                                        widgetBodega
                                    ]
                                },
                                {
                                    view: 'resizer'
                                },
                                {
                                    rows: [
                                        { template: "<h3 style='text-align: center'>Listado de Precios</h3>", height: 40 },
                                        widgetPrecios
                                    ]
                                }

                            ]
                        }
                    ]
                }
                ]
            },
            {
                view: 'form',
                id: 'valorFactura',
                elements: [
                    {
                        cols: [
                            { view: "text", id: 'subtotal', name: 'subtotal', paddingX: 100, label: "SUBTOTAL", labelPosition: "top" },
                            { view: "text", id: 'desc', name: 'desc', label: "DESCUENTO", labelPosition: "top" },
                            { view: "text", id: 'sub0', name: 'sub0', label: "SUBTOTAL 0%", labelPosition: "top" },
                            { view: "text", id: 'sub12', name: 'sub12', label: "SUBTOTAL 12%", labelPosition: "top" },
                            { view: "text", id: 'iva', name: 'iva', label: "IVA", labelPosition: "top" },
                            { view: "text", id: 'total', name: 'total', label: "TOTAL", labelPosition: "top" },
                            { view: "button", value: "FACTURAR", css: "webix_danger" }
                        ]
                    }
                ]
            }
        ],
    });

    // funcion que agrega un producto a la factura al hacer doble click en el item de la tabla productos
    $$('productos').attachEvent("onItemDblClick", function (id, e, node) {
        var item = this.getItem(id)
        console.log(item)
        $$('factura').add(
            {
                cant: 1,
                descripcion: item.descripcion,
                desc: 0.00,
                subtotal: parseFloat((item.valor_iva).toFixed(2))
            })

        // Se obtiene el footer de la tabla Detalle de factura
        subtotal = $$('factura').getFooterNode('total').textContent
        sub = (parseFloat(subtotal)).toFixed(2)
        iva = parseFloat((sub * 0.12).toFixed(2))
        console.log(typeof (sub))
        total = parseFloat(sub) + iva
        // Se carga los datos al formulario de con el ID valorfactura
        $$('valorFactura').setValues({
            subtotal: sub,
            desc: 0,
            sub0: 0,
            sub12: sub,
            iva: iva,
            total: total.toFixed(2)
        })
    });

    // función que retorna los datos de los clientes por ID
    let getClient = (cliente) => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('idCliente', cliente);
            ipcRenderer.on('cliente', (evento, cliente) => {
                resolve(cliente)
            })
        })
    }

    // evento que se ejecuta al hacer ENTER en el buscador de clientes
    $$('buscarCliente').attachEvent('onEnter', function (env) {
        text_search = this.getValue();
        getClient(text_search).then((cliente) => {
            cliente.forEach(e => {
                console.log(e)
                data_list_popup.add({
                    name: e.customer_name, ci_ruc: e.tax_id, direccion: e.direccion_fact, telefono: e.telefono_fact, correo: e.email_fact
                })
            })
        })
        //Limpia el popup
        data_list_popup.clearAll()
    })
    //evento que se ejecuta al hacer click en el icono BUSCAR del buscador de clientes
    $$("buscarCliente").attachEvent("onSearchIconClick", function (e) {
        text_search = this.getValue();
        getClient(text_search).then((cliente) => {
            cliente.forEach(e => {
                data_list_popup.add({
                    name: e.customer_name, ci_ruc: e.tax_id, direccion: e.direccion_fact, telefono: e.telefono_fact, correo: e.email_fact
                })
            })
        })
        //Limpia el popup
        data_list_popup.clearAll()
    });

    //Se captura el ID del elemento seleccionado del POPUP
    $$('lista_clientes').attachEvent("onAfterSelect", function (id) {
        //Se obtiene el objeto con los datos del cliente
        var cliente = $$('lista_clientes').getItem(id)
        // Se inserta los datos del cliente en el formulario.
        $$("datos-cliente").setValues({
            nombre: cliente.name,
            ci_ruc: cliente.ci_ruc,
            direccion: cliente.direccion,
            telefono: cliente.telefono,
            correo: cliente.correo
        });
    })


    $$("formClienteBuscador").setValues({
        buscarCliente: 'nombre'
    });

    $$('searchProduct').attachEvent('onEnter', function (e) {
        var searchText = this.getValue();
        console.log(searchText)
        if (searchText.length > 0) {
            $$('productos').clearAll();
            getProduct(searchText).then((product) => {
                product.forEach(element => {
                    $$('productos').add(
                        {
                            id: element.rowid,
                            codigo: element.codigo,
                            descripcion: element.descripcion,
                            valor_iva: parseFloat((element.valor_iva).toFixed(2))
                        })

                })
            })
        } else {
            ipcRenderer.on('products', (evento, productos) => {
                productos.forEach(element => {
                    $$('productos').add(
                        {
                            id: element.rowid,
                            codigo: element.codigo,
                            descripcion: element.descripcion,
                            valor_iva: parseFloat((element.valor_iva).toFixed(2))
                        })
                });
            })
        }

    })

    // función que retorna los datos de los clientes por ID
    let getProduct = (product) => {
        return new Promise((resolve, reject) => {
            ipcRenderer.send('id_product', product);
            ipcRenderer.on('product', (evento, product) => {
                console.log('llego la vaina loca')
                resolve(product)
            })
        })
    }

    // Esta a la escucha del canal PRODUCTS que se envia desde electron.
    ipcRenderer.on('products', (evento, productos) => {
        productos.forEach(element => {
            $$('productos').add(
                {
                    id: element.rowid,
                    codigo: element.codigo,
                    descripcion: element.descripcion,
                    valor_iva: parseFloat((element.valor_iva).toFixed(2))
                })
        });
    })
    /*
        $$('valorFactura').setValues({
            subtotal: 
        })*/
})

// Popup del buscador de clientes
var popup = webix.ui({
    view: "popup",
    id: "my_pop",

    body: {
        id: 'lista_clientes',
        view: "list",
        data: data_list_popup,
        template: "#name# - #ci_ruc#",
        autoheight: true,
        select: true
    }
});

popup.attachEvent("onShow", function (id) {
    $$('buscarCliente').focus()
})