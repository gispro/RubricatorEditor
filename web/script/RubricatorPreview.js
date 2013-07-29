Ext.require([
    'GeoExt.panel.Map'
    ]);
    

var map, demolayer;                      
OpenLayers.DOTS_PER_INCH = 90.71428571428572;
OpenLayers.Util.onImageLoadErrorColor = 'transparent';

function addLayer(json) {
    var layer;
    if (json.servicetype=='wms') {
        layer = new OpenLayers.Layer.WMS(
            json.nodename, json.serverpath+"/"+json.servicepath,
            {
                layers: json.layername, 
                styles: json.stylename,
                format: 'image/png',
                transparent: true,
                tiled: true,
                version: '1.3.0',
                SRS: 'EPSG:900913'
            },
            {
                tileSize: new OpenLayers.Size(256,256),
                //projection: new OpenLayers.Projection("EPSG:4326"),
                wrapDateLine: true
            });
    //layer.params.src = layer.projection.projCode;
    } else if (json.servicetype=='rss') {
        layer = new OpenLayers.Layer.GeoRSS(json.nodename, json.serverpath+"/"+json.servicepath, {
            projection: new OpenLayers.Projection("EPSG:4326"),
            icon: new OpenLayers.Icon("./" + json.stylename.split('script/').pop().replace('images','img'), new OpenLayers.Size(21,25))
        });
    }
    map.addLayer(layer);
    layer.setVisibility(true);
}

function getMap() {
    var mapOptions = {
        //resolutions: [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135, 0.29858214169740677, 0.14929107084870338, 0.07464553542435169, 0.037322767712175846, 0.018661383856087923, 0.009330691928043961, 0.004665345964021981, 0.0023326729820109904, 0.0011663364910054952, 5.831682455027476E-4, 2.915841227513738E-4, 1.457920613756869E-4],
        projection: new OpenLayers.Projection('EPSG:900913'),
        //maxExtent: new OpenLayers.Bounds(-2.003750834E7,-2.003750834E7,2.003750834E7,2.003750834E7),
        units: "meters"
    };
    map = new OpenLayers.Map(undefined, mapOptions);
    map.addControl(new OpenLayers.Control.Navigation());
    demolayer = new OpenLayers.Layer.WMS(
        "eko_merge", CONFIG.CACHE_URL,
        {
            layers: 'eko_merge', 
            format: 'image/png',
            SRS: 'EPSG:900913'
        },
        {
            tileSize: new OpenLayers.Size(256,256),
            wrapDateLine: true
        });
    map.addLayer(demolayer);
    return map;
}


Ext.define('Ext.gispro.RubricatorPreview', {
    extend: 'Ext.Window',
    xtype: 'rubricatorPreview',
    maximizable: true,
    width: 600,
    height: 600,
    initComponent: function() {
        Ext.apply(this, {
            title: 'Предпросмотр',            
            listeners: {
                afterrender: function() {
                    addLayer(Ext.getCmp('rubricatorPreview').jsonNode);
                }
            },
            layout: 'fit',
            items: [
            Ext.create('GeoExt.panel.Map', {
                map: getMap(),
                center: '0.0,0.0',
                zoom: 2
            })
            ]
        });
        this.callParent(arguments);
    }
    
})