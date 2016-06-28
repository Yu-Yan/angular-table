
var ng = angular.module('app');

ng.directive('angularTable', ['$timeout',
    function($timeout) {

        return {
            restrict: 'EA',
            replace: true,
            transclude: true,
            templateUrl: 'angular-table-template.html',
            scope: {
                config: '='
            },
            link: function (scope, ele, attrs) {

                var show_loading = false;
                var _timer = null;

                scope.config.currentSort = {};

                scope.pageSizeChoiceList = [];
                scope.curPageNumber = 1;
                scope.datas = {total: 0, rows: []};
                scope.originalPageNumberList = [];
                scope.pageNumberList = [];
                scope.refresh = _refreshPage;
                scope.onClickSortButton = onClickSortButton;
                scope.config.currentSort = [scope.config.params.sort, scope.config.params.order]; //can be undefined

                scope.config.refresh = _refreshPage;
                scope.config.gotoFirstPage = function(){
                    _gotoPage(1);
                }

                scope.gotoPage = _gotoPage;

                init();

                function onClickSortButton(field, sortable){
                    if(!sortable) return;
                    if(field == scope.config.currentSort[0]){
                        if(scope.config.currentSort[1] == 'desc'){
                            scope.config.params.order = 'asc';
                        }else if(scope.config.currentSort[1] == 'asc'){
                            scope.config.params.order = 'desc';
                        }
                    }else{
                        scope.config.params.sort = field;
                        scope.config.params.order = 'desc';
                    }
                    scope.config.currentSort = [scope.config.params.sort, scope.config.params.order];
                }

                function _gotoPage(curPageNumber){
                    if(curPageNumber < 1 || curPageNumber > Math.ceil(scope.datas.total/scope.config.params.limit)) return;
                    if(scope.config.params.offset == scope.config.params.limit * (curPageNumber - 1)) _refreshPage();
                    else scope.config.params.offset = scope.config.params.limit * (curPageNumber - 1);
                }

                function _refreshPage(){
                    show_loading && scope.config.showLoading();
                    var datas = scope.config.params;
                    for(var key in scope.config.params){
                        if(datas[key] === null || datas[key] === undefined){
                            delete datas[key];
                        }
                    }
                    scope.config.updateDatas(datas).then(function(response, status){
                        if(response.code < 0){
                            show_loading && scope.config.hideLoading();
                            throw 'service error';
                        }else{
                            scope.datas = response.data;
                        }
                    }, function(xhr, status){
                        show_loading && scope.config.hideLoading();
                        throw xhr.data.error;
                    });
                    show_loading && scope.config.hideLoading();
                    _afterDataReady();
                }

                function _afterDataReady(){
                    scope.originalPageNumberList = [];
                    scope.pageNumberList = [];

                    for(var i = 1; i <= Math.ceil(scope.datas.total/scope.config.params.limit); i++){
                        scope.originalPageNumberList.push(i);
                    }
                    var totalPageNumbers = scope.originalPageNumberList.length;

                    var pageOptionNumber = scope.config.pageOptionNumber,
                        halfPageOptionNumber = Math.round(pageOptionNumber/2);

                    if(totalPageNumbers > pageOptionNumber){
                        if(scope.curPageNumber < halfPageOptionNumber){
                            scope.pageNumberList = scope.originalPageNumberList.slice(0, totalPageNumbers > pageOptionNumber ? pageOptionNumber : totalPageNumbers);
                        }else if(totalPageNumbers - scope.curPageNumber < pageOptionNumber){
                            scope.pageNumberList = scope.originalPageNumberList.slice(totalPageNumbers - pageOptionNumber - 1, totalPageNumbers - 1);
                        }else{
                            scope.pageNumberList = scope.originalPageNumberList.slice(scope.curPageNumber - halfPageOptionNumber, scope.curPageNumber + halfPageOptionNumber);
                        }
                    }else{
                        scope.pageNumberList = scope.originalPageNumberList;
                    }
                }

                function init(){

                    scope.config.params.limit = scope.config.params.limit ? scope.config.params.limit : scope.config.pageSizeChoice[0];

                    if(scope.config.toolRight instanceof Array && scope.config.toolRight.length > 0){
                        scope.config.toolRight.sort(function(a, b){
                            return 1;
                        })
                    }

                    angular.forEach(scope.config.pageSizeChoice, function(choice, index){
                        scope.pageSizeChoiceList.push({name: choice, value: choice});
                    });

                    scope.pageSize = scope.pageSizeChoiceList[0];

                    scope.$watch('config.params.offset', function(newVal, oldVal){
                        console.log('new offset: ', newVal);
                        scope.curPageNumber = Math.ceil(scope.config.params.offset/scope.config.params.limit) + 1;
                    });

                    scope.$watch('pageSize', function(newVal, oldVal){
                        console.log('new pageSize: ', newVal.value);
                        scope.config.params.limit = newVal.value;
                    });

                    scope.$watch('config.params', function(newVal, oldVal){
                        console.log('new query params: ', newVal);
                        if(_timer){
                            $timeout.cancel(_timer);
                        }
                        _timer = $timeout(_refreshPage, 600);
                    }, true);

                    if(typeof(scope.config.showLoading) == 'function' && typeof(scope.config.hideLoading) == 'function'){
                        show_loading = true;
                    }
                }
            }
        }
    }
]);

ng.directive('angularTableCell', ['$compile', function($compile){

    return {
        restrict: 'E',
        replace: false,
        //require: '?^^angularTable',
        scope: {
            data: '=',
            formatter: '=',
            initializer: '=',
            row: '='
        },
        template: '<div></div>',
        link: function(scope, ele, attrs){

            scope.datas = {data: scope.data};

            var innerElementString = '';
            if(typeof(scope.formatter) == 'function'){
                innerElementString = scope.formatter(scope.data);
            }else{
                innerElementString = '<span>' + scope.data + '</span>';
            }

            var innerElement = $compile(innerElementString)(scope);

            ele.append(innerElement);

            if(scope.initializer){
                if(typeof(scope.initializer) != 'function') throw 'initializer must be function type';
                scope.initializer(scope.data, scope.row, scope);
            }
        }
    }
}]);

ng.directive('angularTableToolbar', ['$compile', function($compile){

    return {
        restrict: 'E',
        replace: true,
        //require: '?^^angularTable',
        scope: {
            formatter: '=',
            initializer: '=',
            params: '=',
            refresh: '='
        },
        template: '<div style="display: inline-block"></div>',
        link: function(scope, ele, attrs){

            var innerElementString = typeof(scope.formatter) == 'function' ? scope.formatter() : scope.formatter,
                innerElement = $compile(innerElementString)(scope);

            ele.append(innerElement);

            if(scope.initializer){
                if(typeof(scope.initializer) != 'function') throw 'initializer must be function type';
                scope.initializer(scope);
            }
        }
    }
}]);