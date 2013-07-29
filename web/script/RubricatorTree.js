var store = Ext.create('Ext.data.TreeStore', {
    root: {
        expanded: true,
        text: "Рубрики",
        jsonNode: {
            nodeid: '.'
        }
    }
});

var initTreeStore = function(parsedJson) {
    var r = Ext.getCmp('rubricatorTree').getRootNode();
    r.removeAll();
    addChildren(r, parsedJson);
}



var addChildren = function(node, jsonNode) {
    for (var i = 0; i < jsonNode.children.length; i++) {
        var n = node.createNode({
            text: jsonNode.children[i].nodename,
            iconCls: (jsonNode.children[i].isservice == "1" ? "gxp-isservice" : jsonNode.children[i].islayer == "1" ?
                jsonNode.children[i].servicetype == "wms" ? "gxp-islayer"
                : jsonNode.children[i].servicetype == "rss" ? "gxp-feed"
                : jsonNode.children[i].servicetype == "animation" ? "gxp-control" : "gxp-islayer"
                : "gxp-folder"),
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

Ext.define('filterModel', {
    extend: 'Ext.data.Model',
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
    ]
});
// store auto complete
var autoCompleteStore = Ext.create('Ext.data.Store', {
    model: 'filterModel',
    autoLoad: true,
    proxy: {
        type: 'ajax',
        url: CONFIG.PROXY + CONFIG.OVROOT + 'services?service=rubricator&action=getList',
        reader: {
            type: 'json',
            root: 'layers'
        }
    }
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
            valueField:'id',
            queryMode: 'local',
            minChars:1,
            forceSelection:true,
            typeAhead:true,
            triggerAction:  'all',
            columnWidth: .90,
            id: 'rubricatorFilterCombo',
            displayField: 'nodename',
            store: autoCompleteStore,           
            emptyText: 'Фильтр...',
            doQuery: function (e,b,d){
                var c=this,a=c.beforeQuery({
                    query:e||"",
                    rawQuery:d,
                    forceAll:b,
                    combo:c,
                    cancel:false
                });
                if(a===false||a.cancel){
                    return false
                }
                if(c.queryCaching&&a.query===c.lastQuery){
                    c.expand()
                }else{
                    c.lastQuery=a.query;
                    //                    if(c.queryMode==="local"){
                    c.doLocalQuery(a)
                //                        }else{
                //                        c.doRemoteQuery(a)
                //                        }
                }
                return true
            },	
            anyMatch: true,
            caseSensitive: false,                            
            listeners: {
                beforeselect: function(ui, el) {
                    if (el.raw) 
                        Ext.getCmp('rubricatorTree').expandByNodeId(el.raw.nodeid);
                }
            }
        },
        {
            xtype: 'tbspacer',
            columnWidth: .05
        },
        {
            text: 'Параметр',
            menu: {
                id: 'rubricatorFilterParamMenu',
                items: [{
                    xtype: 'radiogroup',
                    columns: 1,
                    style: 'margin-left:6px',
                    vertical: true,
                    listeners: {
                        change: function(radiogroup, radio) {
                            var combo = Ext.getCmp('rubricatorFilterCombo');
                            combo.clearValue();
                            combo.displayField = radio['rb'];
                            Ext.getCmp('rubricatorFilterParamMenu').hide();                            
                            combo.displayTpl = new Ext.XTemplate('<tpl for=".">{' + radio['rb'] + '}</tpl>');
                            //combo.view.refresh();
                            var picker = combo.getPicker();    
                            picker.tpl = new Ext.XTemplate('<tpl for="."><div class="x-boundlist-item">{' + radio['rb'] + '}</div></tpl>');
                            ;
                            picker.refresh();
                        }
                    },
                    items: [
                    {
                        boxLabel: 'Наименование',
                        name: 'rb',
                        inputValue: 'nodename',
                        checked: true

                    },
                    {
                        boxLabel: 'Адрес сервера',
                        name: 'rb',
                        inputValue: 'serverpath'
                    },
                    {
                        boxLabel: 'ИД ресурса',
                        name: 'rb',
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
    expandByNodeId: function(nodeid){
        var _this = this;
        this.collapseAll();
        var ids = nodeid.split('.');
        var r = this.getStore().getRootNode();
        var cur = "";
        var n, lastParent;
        ids.every(function(el,idx){
            if (idx == ids.length-1) return;
            cur+=el+"."; 
            n = r.findChildBy(function(a){
                return a.raw.jsonNode ? a.raw.jsonNode.nodeid==cur : false
            },null,true);
            if (n) {
                lastParent = n;
                // n.select();
                _this.getSelectionModel().select(n)
                n.expand();		
//                n.renderChildren();
            } else {
                var node = lastParent.childNodes.filter(function(e) {
                    return e.layer.jsonNode.nodeid==nodeid
                })[0];
                //node.select();
                _this.getSelectionModel().select(node)
            }			
            return true;
        });		
        if (n && n.select) n.select();
    },
	
    collapseAll: function() {
        this.getStore().getRootNode().cascadeBy(function(n){
            n.collapseChildren();
        })
    },
    refreshStores: function(){
        Ext.Ajax.request({
            url: CONFIG.PROXY + CONFIG.OVROOT + 'services?service=rubricator&action=getTree',
            success: function(r) {
                var json = JSON.parse(r.responseText);
                initTreeStore(json);
            },
            failure: function(r) {

            }
        });
        window.autocompleteStore && autocompleteStore.reload();
    },
    listeners: {
        render: function() {            
            var c = Ext.getCmp('rubricatorTree');
            if (c.loaded) return; 
            c.refreshStores();
            c.loaded = true;
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