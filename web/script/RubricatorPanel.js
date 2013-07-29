var services = Ext.create('Ext.data.Store', {
    fields: ['title', 'value'],
    data : [
    {
        "title":"WMS", 
        "value":"wms"
    },

    {
        "title":"GeoRSS", 
        "value":"rss"
    },

    {
        "title":"ArcGIS", 
        "value":"animation"
    }
    ]
});

var setAllowBlank= function(){
    Ext.getCmp('serverpathField').allowBlank = true;
    Ext.getCmp('servicepathField').allowBlank = true;            
    Ext.getCmp('layernameField').allowBlank = true;            
    var isservice = Ext.getCmp('isserviceField').getValue();
    if (isservice) {
        Ext.getCmp('serverpathField').allowBlank = false;
        Ext.getCmp('servicepathField').allowBlank = false;            
    } 
    var islayer = Ext.getCmp('islayerField').getValue();
    if (islayer) {
        Ext.getCmp('serverpathField').allowBlank = false;
        Ext.getCmp('servicepathField').allowBlank = false;            
        Ext.getCmp('layernameField').allowBlank = false;            
    }
}

var validateService = function() {
    var isservice = Ext.getCmp('isserviceField').getValue();
    if (isservice) {
        if (!Ext.getCmp('serverpathField').getValue()) {
            Ext.Msg.alert('Ошибка','Не указан адрес сервера');
            return false;
        }
        if (!Ext.getCmp('servicepathField').getValue()) {
            Ext.Msg.alert('Ошибка','Не указан путь к сервису');
            return false;
        }
    }else return true;
}

var validateLayer = function() {
    var islayer = Ext.getCmp('islayerField').getValue();
    if (islayer) {
        if (!Ext.getCmp('serverpathField').getValue()) {
            Ext.Msg.alert('Ошибка','Не указан адрес сервера');
            return false;
        }
        if (!Ext.getCmp('servicepathField').getValue()) {
            Ext.Msg.alert('Ошибка','Не указан путь к сервису');
            return false;
        }
        if (!Ext.getCmp('layernameField').getValue()) {
            Ext.Msg.alert('Ошибка','Не указано имя слоя');
            return false;
        }
    }else return true;
}

Ext.define('Ext.gispro.RubricatorPanel', {
    extend: 'Ext.FormPanel', //Extending the FormPanel
    xtype: 'rubricatorPanel', //Defining the xtype
    id: 'rubricatorPanel',
    flex: 1,
    autoScroll: true,
    enableDD: true,
    renderTo: Ext.getBody(),
    rootVisible: false,
    mode: 'edit',
    fields: ["gid", "nodeid", "nodename", "resourceid", "layername", "stylename", "serverpath", "servicepath", "servicetype", "parentnode", "isservice", "islayer", "workspace", "children"],
    setMode: function(mode) {
        var getNewNodeId = function (parent) {
            var arr = Ext.getCmp('rubricatorFilterCombo').getStore().getRange().filter(function(el){
                return el.parentnode==parent
            });
            if (arr.length==0) return (parent=="." ? "1." :parent+"1.");            
            var n = arr.pop();
            var narr = n['nodeid'].split(".");
            narr[narr.length-2] = parseInt(narr[narr.length-2])+1;
            var res = narr.join(".");
            return res[res.length-1]=="." ? res : res +'.'
        }
            
            
        this.mode = mode;
        var parent = Ext.getCmp('nodeidField').getValue();
        this.clearFields(parent);
        if (mode=="new"){            
            Ext.getCmp('parentnodeField').setValue(parent);            
            var nodeid = getNewNodeId (parent);                
            Ext.getCmp('nodeidField').setValue(nodeid);
            Ext.getCmp('removeButton').disable();
        }        
    },
    clearFields: function() {
        for (var i in this.fields) {
            var c = Ext.getCmp(this.fields[i] + 'Field');
            if (c) {
                c.setValue("");
            }
        }
        Ext.getCmp('servicetypeField').setValue('wms');
    },
    setFields: function(jsonNode) {
        this.setMode("edit");
        for (var i in jsonNode) {
            var c = Ext.getCmp(i + 'Field');
            if (c) {
                c.setValue(jsonNode[i]);
            }
        }        
    },
    togglePreview: function(jsonNode){
        jsonNode.islayer == "1" ? Ext.getCmp('previewButton').enable() : Ext.getCmp('previewButton').disable();
        jsonNode.workspace ? Ext.getCmp('metadataButton').enable() : Ext.getCmp('metadataButton').disable();        
        jsonNode ? Ext.getCmp('removeButton').enable() : Ext.getCmp('removeButton').disable();        
    },
    tbar: {
        items: [
        {
            xtype: 'button',
            toggle: false,
            text: 'Сохранить',
            handler: function() {
                setAllowBlank();
                
                if (Ext.getCmp('islayerField').getValue() && Ext.getCmp('isserviceField').getValue() ) {
                    Ext.Msg.alert('Ошибка','Узел должен иметь определенный тип');
                    return;
                }
                
                if (!Ext.getCmp('nodenameField').getValue()) {
                    Ext.Msg.alert('Ошибка','Не указано наименование узла');
                    return;
                }
                
                if (! (validateService() & validateLayer()) ) return;
                var json = {
                    data:{}
                };
                for (var i in Ext.getCmp('rubricatorPanel').fields) {
                    var c = Ext.getCmp(Ext.getCmp('rubricatorPanel').fields[i] + 'Field');
                    if (c) {
                        json.data[Ext.getCmp('rubricatorPanel').fields[i]] = c.getValue();
                    }                    
                }
                json.data.isservice = json.data.isservice ? "1" : "0";
                json.data.islayer = json.data.islayer ? "1" : "0";
                Ext.Ajax.request({
                    url: CONFIG.CONFIG.PROXY + CONFIG.CONFIG.OVROOT + 'services?service=rubricator&action='+ (Ext.getCmp('rubricatorPanel').mode=="new"?"insert":"update"),
                    params: {
                        data: JSON.stringify(json.data)
                    },
                    success: function(r) {
                        Ext.getCmp('rubricatorTree').refreshStores();
                        Ext.Msg.alert('Информация','Данные успешно обновлены');
                    },
                    failure: function(r) {
                        Ext.Msg.alert('Ошибка','Ошибка при обновлении данных');
                    }
                });
            }
        },
        {
            xtype: 'button',
            toggle: false,
            text: 'Добавить дочерний узел',
            handler: function() {
                Ext.getCmp('rubricatorPanel').setMode('new');  
            }
        },
        {
            xtype: 'button',
            toggle: false,
            disabled: true,
            id: 'removeButton',
            text: 'Удалить',
            handler: function() {
                //Ext.getCmp('rubricatorPanel').setMode('new');  
                //Ext.getCmp('rubricatorTree').refreshStores()
                var json = Ext.getCmp('rubricatorTree').getSelectionModel().selected.items[0].raw.jsonNode
                Ext.MessageBox.show({
                    title:'Удалить',
                    msg: 'Вы действительно хотите удалить узел "'+ (json.nodename || "[без названия]") +'"?',
                    buttons: Ext.MessageBox.YESNO,
                    buttonAlign:'center',
                    buttonText: {
                        yes: "Да",
                        no: "Нет"
                    } ,
                    fn: function(btn){
                        if (btn=="yes") {
                            Ext.Ajax.request({
                                url: CONFIG.PROXY + CONFIG.OVROOT + 'services?service=rubricator&action=remove',
                                params: {
                                    gid: json.gid
                                },
                                success: function(r) {
                                    Ext.getCmp('rubricatorTree').refreshStores();
                                    Ext.Msg.alert('Информация','Данные успешно обновлены');
                                },
                                failure: function(r) {
                                    Ext.Msg.alert('Ошибка','Ошибка при обновлении данных');
                                }
                            });
                        } 
                    },
                    icon: Ext.MessageBox.QUESTION
                });
            }
        },{
            xtype: 'tbseparator'
        },{
            xtype: 'button',
            id: 'previewButton',
            toggle: false,
            text: 'Предпросмотр',
            disabled: true,
            handler: function() {
                var cmp = Ext.getCmp('rubricatorPreview');
                cmp && cmp.destroy();
                var p = Ext.create('Ext.gispro.RubricatorPreview', {
                    id: 'rubricatorPreview',
                    jsonNode: Ext.getCmp('rubricatorTree').getSelectionModel().selected.items[0].raw.jsonNode
                });
                p.show();
            }
        },{
            xtype: 'tbseparator'
        }, {
            xtype: 'button',
            id: 'metadataButton',
            toggle: false,
            text: 'Метаданные ресурса',            
            disabled: true,
            handler: function() {
                var p = Ext.create('Ext.Window', {
                    title: 'Метаданные ресурса',
                    maximizable: true,
                    width: 700,
                    height: 500,
                    layout: 'fit',
                    items: [{
                        xtype: 'panel',
                        style: {
                            "padding": "5px",
                            width: "97%",
                            height: "100%"
                        },
                        autoWidth: true,
                        html: "<iframe width=\"100%\" height=\"100%\" src=\""+CONFIG.METADATA_URL + Ext.getCmp('rubricatorTree').getSelectionModel().selected.items[0].raw.jsonNode.workspace+"\"/>"
                    }]												
                });
                p.show();
            }
        }
        ]
    },
    items: [
    {
        layout: 'form',
        style: 'padding:5px',
        bodyStyle: 'padding:5px',
        border: 0,
        items: [{
            xtype: 'textfield',
            id: 'gidField',
            hidden: true
        }, {
            xtype: 'textfield',
            id: 'nodeidField',
            readOnly: true,
            fieldLabel: 'ИД узла'
        },{
            xtype: 'textfield',
            id: 'nodenameField',
            allowBlank:false,
            blankText: "Введите наименование узла",
            fieldLabel: 'Наименование узла'
        }, {
            xtype: 'textfield',
            id: 'resourceidField',
            blankText: "Введите ИД ресурса",
            fieldLabel: 'ИД ресурса'
        }, {
            xtype: 'textfield',
            id: 'layernameField',
            blankText: "Введите имя слоя",
            fieldLabel: 'Имя слоя'
        }, {
            xtype: 'textfield',
            id: 'stylenameField',
            blankText: "Введите имя стиля",
            fieldLabel: 'Имя стиля'
        }, {
            xtype: 'textfield',
            id: 'serverpathField',
            lankText: "Введите адрес сервера",
            fieldLabel: 'Адрес сервера'
        }, {
            xtype: 'textfield',
            id: 'servicepathField',           
            blankText: "Введите адрес сервиса",
            fieldLabel: 'Адрес сервиса'
        }, {
            xtype: 'combo',
            id: 'servicetypeField',
            fieldLabel: 'Тип сервиса',            
            blankText: "Введите тип сервиса",
            store: services,
            queryMode: 'local',
            displayField: 'title',
            valueField: 'value',
            value:'wms'
        }, {
            xtype: 'textfield',
            id: 'parentnodeField',
            readOnly: true,
            fieldLabel: 'ИД родительского узла'
        }, {
            xtype: 'checkbox',
            id: 'isserviceField',
            fieldLabel: 'Это сервис'
        }, {
            xtype: 'checkbox',
            id: 'islayerField',
            fieldLabel: 'Это слой'
        }, {
            xtype: 'textfield',
            id: 'workspaceField',
            blankText: "Введите рабочее пространство",
            fieldLabel: 'Рабочее пространство'
        }]
    }]
})
