var store = Ext.create('Ext.data.TreeStore', {
    root: {
        expanded: true,
        text: "Рубрики"
    }
});

var initTreeStore = function(parsedJson) {
    var r = Ext.getCmp('rubricatorTree').getRootNode();
    addChildren(r, parsedJson)
}

var initFitlerStore = function(parsedJson) {
    Ext.getCmp('rubricatorFilterCombo').getStore().removeAll();
    Ext.getCmp('rubricatorFilterCombo').getStore().add(new Ext.data.ArrayStore ({
        fields: [
        {
            name: 'nodename', 
            mapping: 'nodename'
        },

        {
            name: 'nodeid', 
            mapping: 'nodeid'
        },

        {
            name: 'resourceid', 
            mapping: 'resourceid'
        },

        {
            name: 'serverpath', 
            mapping: 'serverpath'
        }
        ],
        data: treeToArray(parsedJson)
    }).getRange());
}

var treeToArray= function(layers){
    var arr = [];		
    cascade = function(r,f) {
        f.call(this,r);
        r.children.every(function(e){
            cascade(e,f);
            return true;
        })
    };
    cascade(layers,function(e){
        arr.push(e)
    });    	
    return arr;
}

var addChildren = function(node, jsonNode) {
    for (var i = 0; i < jsonNode.children.length; i++) {
        var n = node.createNode({
            text: jsonNode.children[i].nodename,
            iconCls: jsonNode.children[i].isservice == "1" ? "gxp-isservice" : jsonNode.children[i].islayer == "1" ?
            jsonNode.children[i].servicetype == "wms" ? "gxp-islayer"
            : jsonNode.children[i].servicetype == "rss" ? "gxp-feed"
            : jsonNode.children[i].servicetype == "animation" ? "gxp-control" : "gxp-islayer"
            : "gxp-folder",
            expanded: false,
            singleClickExpand: true,
            isTarget: false,
            leaf: jsonNode.children[i].islayer == "1",
            id: 'rubricatorLayer' + jsonNode.children[i].nodeid,
            jsonNode: jsonNode.children[i]
        });
        node.appendChild(n);
        addChildren(n, jsonNode.children[i]);
    }
}

var filterStore = new Ext.data.ArrayStore ({
    //mode: 'local',
    fields: [
    {
        name: 'nodename', 
        mapping: 'nodename'
    },
    {
        name: 'resourceid', 
        mapping: 'resourceid'
    },
    {
        name: 'serverpath', 
        mapping: 'serverpath'
    }
    ],
    data: [ ]
});

Ext.define('Ext.gispro.RubricatorTree', {
    extend: 'Ext.TreePanel', //Extending the TreePanel
    xtype: 'rubricatorTree', //Defining the xtype
    id: 'rubricatorTree',
    tbar: {
        layout: 'column',
        items: [
        {
            xtype: 'combo',
            columnWidth: .90,
            id: 'rubricatorFilterCombo',
            valueField: 'nodeid',
            displayField: 'nodename',
            enableKeyEvents: true,
            store: filterStore,
           /* doQuery: function(c, b) {
                c = Ext.isEmpty(c) ? "" : c;
                var a = {
                    query: c, 
                    forceAll: b, 
                    combo: this, 
                    cancel: false
                };
                if (this.fireEvent("beforequery", a) === false || a.cancel) {
                    return false
                }
                c = a.query;
                b = a.forceAll;
                //if (b === true) {
                    if (this.lastQuery !== c) {
                        this.lastQuery = c;
                        if (this.mode == "local") {
                            this.selectedIndex = -1;
                            if (b) {
                                this.store.clearFilter()
                            } else {
                                this.store.filter(this.displayField, c, true, false)
                            }
                            this.onLoad()
                        } else {
                            this.store.baseParams[this.queryParam] = c;
                            this.store.load({
                                params: this.getParams(c)
                            });
                            this.expand()
                        }
                    } else {
                        this.selectedIndex = -1;
                        this.onLoad()
                    }
               // }
            },*/
            typeAhead: false,
            emptyText: 'Фильтр...',
            triggerAction: "all",
            mode: "local",
            listeners: {
                select: function(ui, el) {
                //app.tools.gxp_rubricatortree_ctl.expandByNodeId(el.json.nodeid);
                }
            }
        },
        {
            xtype: 'tbspacer',
            columnWidth: .05,
        },
        {
            text: 'Параметр',
            menu: {
                id: 'rubricatorFilterParamMenu',
                items: [{
                    xtype: 'radiogroup',
                    itemCls: 'x-check-group-alt',
                    columns: 1,
                    style: 'margin-left:6px',
                    vertical: true,
                    listeners: {
                        change: function(radiogroup, radio) {
                            var combo = Ext.getCmp('rubricatorFilterCombo');
                            combo.clearValue();
                            combo.displayField = radio.inputValue;
                            Ext.getCmp('rubricatorFilterParamMenu').hide();
                            if (!combo.view)
                                return;
                            combo.view.tpl = new Ext.XTemplate('<tpl for="."><div>{' + radio.inputValue + '}</div></tpl>');
                            combo.view.refresh();
                        }
                    },
                    items: [
                    {
                        boxLabel: 'Наименование',
                        inputValue: 'nodename',
                        checked: true

                    },
                    {
                        boxLabel: 'Адрес сервера',
                        inputValue: 'serverpath'
                    },
                    {
                        boxLabel: 'Идентификатор ресурса',
                        inputValue: 'resourceid'
                    }
                    ]
                }]
            }
        }
        ]
    },
    store: store,
    rootVisible: true,
    singleClickExpand: true,
    flex: 1,
    autoScroll: true,
    enableDD: true,
    loaded: false,
    listeners: {
        render: function() {            
            if (Ext.getCmp('rubricatorTree').loaded) return;
            Ext.Ajax.request({
                url: 'http://oceanviewer.ru/ovdev/services?service=rubricator&action=getTree',
                success: function(r) {
                    var json = JSON.parse(r.responseText);
                    initTreeStore(json);
                    initFitlerStore(json);
                },
                failure: function(r) {

                }
            });
            Ext.getCmp('rubricatorTree').loaded = true;
        },
        itemclick: function(view, node) {
            if (node.isLeaf()) {
            // some functionality to open the leaf(document) in a tabpanel
            } else if (node.isExpanded()) {
                node.collapse();
            } else {
                node.expand();
            }
        }
    }
})