//var myApp = angular.module('ui.tux.demo', ['ui.tux']);

(function() {

    angular.module("rfpApp", ['ui.tux', 'ngRoute', 'ngResource']);
    angular.module("rfpApp").config(config);
    angular.module("rfpApp").run(runFn);

    function config($routeProvider) {
        $routeProvider.
        when('/create', {
            templateUrl: 'scripts/partials/create.html',
            controller: 'createController'
        }).
        when('/list', {
            templateUrl: 'scripts/partials/lists.html',
            controller: 'gridController'
        }).
        when('/bulkInsert', {
            templateUrl: 'scripts/partials/bulkInsert.html',
            controller: 'bulkInsertController'
        }).
        otherwise({
            redirectTo: '/list'
        });
    }

    function runFn($rootScope, $location) {
        $rootScope.$on('$routeChangeStart', function() {
            var loadingText = "";

            $rootScope.loadingText = "Please Wait Page Loading";
            $rootScope.loadingFlag = true;
        });
    }

})();
