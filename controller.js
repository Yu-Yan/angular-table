"use strict";

app.controller("StoreController",
    ['$scope', 'StoreService',
        function ($scope, StoreService) {

            $scope.table_config = {
                pageSizeChoice: [10, 20, 30],  //limit
                tableContainerClass: '',
                tableClass: 'tableclass',
                headerClass: 'headerclass',
                rowClass: 'rowclass',
                toolbarClass: 'angular-table-toolbarclass',
                toolitemClass: '',
                pageOptionNumber: 6,
                showLoading: function(){
                    console.log('show loading progress...');
                    var mask = '<div id="hellomask" style="height: 100%; width: 100%; background-color: #000; position: absolute; left: 0; top: 0; z-index=10000;"> </div>';
                    $('body').append(mask);
                },
                hideLoading: function(){
                    console.log('hide loading progress......');
                    $('#hellomask').remove();
                },
                params: {
                    // offset: 0,
                    limit: 10,
                    sort: 'id',
                    order: 'desc'
                },
                updateDatas: function(params){
                    return StoreService.getStoreInfos(params);
                },
                toolLeft: [
                    {
                        class: 'className',
                        formatter: '<input class="cssforinput" type="text" ng-model="params.someData" ng-change="onchangesomevalue()"/>',
                        initializer: function(scope){
                            scope.onchangesomevalue = function(){
                                scope.params.someData = 99999;
                            };
                        }
                    },
                    {
                        class: 'className',
                        formatter: '<a type="button" ng-click="refreshTable(this)"><i class="fa fa-refresh"></i></a>'
                    },
                    {
                        class: 'className',
                        formatter: '<select ng-model="params.offset" ng-change="onchangeoffset(this)"><option value="0">0</option><option value="1" selected>1</option><option value="2">2</option></select>'
                    }
                ],

                toolRight: [
                ],

                columns: [
                    {
                        title: 'ID',
                        field: 'id',
                        sortable: true,
                        visible: true,
                        align: 'center',
                        width: '25%',
                        formatter: function(value){
                            return '<input type="text" ng-model="datas.data" ng-change="handler1($event, row)"/>';
                        },
                        initializer: function(value, row, scope){
                        }
                    },
                    {
                        title: '名称',
                        field: 'name',
                        sortable: false,
                        visible: true,
                        align: 'center',
                        width: '25%',
                        formatter: function(value, row, scope){
                            return '<span style="color:red;" ng-click="handler1($event, row)">'+ value +'</span>';
                        }
                    },
                    {
                        title: '联系人',
                        field: 'contacts',
                        sortable: false,
                        visible: false,
                        align: 'center',
                        width: '25%'
                    },
                    {
                        title: '标记',
                        field: 'flag',
                        sortable: true,
                        visible: true,
                        align: 'center',
                        width: '25%'
                    }
                ]
            };

            $scope.onClickSomeButton = function(){
                $scope.table_config.gotoFirstPage();
            };

            function handler1func($event, row){
                var scope = handler1func.scope;
                console.log(scope);
                alert(100000);
                scope.datas.data = 9;
                // alert(JSON.stringify(row));
            }
        }
    ]
);
