Ext.onReady(function() {
    var mainPanel = Ext.create('Ext.panel.Panel', {
        title: 'Редактор рубрикатора',
        layout: 'border',
        defaults: {
            split: true
        },
        height: 700,
        style: "top: auto; bottom: 0;",
        //renderTo: 'mainContainer',
        items: [
        {
            xtype: 'rubricatorTree',
            height: "100%",
            region: "west",
            flex: 1
        }, 
        {
            xtype: 'rubricatorPanel',
            height: "100%",
            region: "center",
            flex: 3,                
            listeners : {
                render : function () {
                    var c = Ext.getCmp('rubricatorTree');
                    c && c.on('select',function(e){
                        var jsonNode = e.selected.items[0].raw.jsonNode;
                        Ext.getCmp('rubricatorPanel').setFields(jsonNode);
                        Ext.getCmp('rubricatorPanel').togglePreview(jsonNode);
                    });
                }
            }
        }
        ]
    });
    var viewPort = new Ext.Viewport({
        renderTo: 'mainContainer',
        layout: "fit",
        items: [ mainPanel ]
    });
    viewPort.doLayout();
});

