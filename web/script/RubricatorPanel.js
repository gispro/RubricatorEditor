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
        this.mode = mode;
        if (mode=="new"){
            this.clearFields();
        }
    },
    clearFields: function() {
        for (var i in this.fields) {
            var c = Ext.getCmp(this.fields[i] + 'Field');
            if (c) {
                c.setValue("");
            }
        }
    },
    setFields: function(jsonNode) {
        for (var i in jsonNode) {
            var c = Ext.getCmp(i + 'Field');
            if (c) {
                c.setValue(jsonNode[i]);
            }
        }
    },
    tbar: {
        items: [
            {
                xtype: 'button',
                text: 'Сохранить'
            },
            {
                xtype: 'button',
                text: 'Добавить дочерний узел',
                handler: function() {
                    Ext.getCmp('rubricatorPanel').setMode('new');                    
                }
            },
            {
                xtype: 'button',
                text: 'Удалить'
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
                    id: 'nodeidField',
                    fieldLabel: 'ИД узла'
                }, {
                    xtype: 'textfield',
                    id: 'nodenameField',
                    fieldLabel: 'Наименование узла'
                }, {
                    xtype: 'textfield',
                    id: 'resourceidField',
                    fieldLabel: 'ИД ресурса'
                }, {
                    xtype: 'textfield',
                    id: 'layernameField',
                    fieldLabel: 'Имя слоя'
                }, {
                    xtype: 'textfield',
                    id: 'stylenameField',
                    fieldLabel: 'Имя стиля'
                }, {
                    xtype: 'textfield',
                    id: 'serverpathField',
                    fieldLabel: 'Адрес сервера'
                }, {
                    xtype: 'textfield',
                    id: 'servicepathField',
                    fieldLabel: 'Адрес сервиса'
                }, {
                    xtype: 'textfield',
                    id: 'servicetypeField',
                    fieldLabel: 'Тип сервиса'
                }, {
                    xtype: 'textfield',
                    id: 'parentnodeField',
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
                    fieldLabel: 'Рабочее пространство'
                }]
        }]
})
