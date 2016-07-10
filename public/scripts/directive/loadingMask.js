(function() {

    angular.module("rfpApp")
        .directive("loadingMask", fnloadingMask)
        .directive("loadingMaskInternal", fnLoadingMaskInternal);

    //Loading Mask For the root 
    function fnloadingMask($rootScope) {
        return {
            restrict: "E",
            scope: {
                'loadingFlag': '=',
                'loadingText': '@'
            },
            templateUrl: './scripts/partials/spinner.html',
            link: function(scope, element, attr) {
                //$rootScope.loadingSpinner = scope.loadingFlag;
                /*var unregister = $rootScope.$on('$routeChangeSuccess', function() {
                    scope.loadingSpinner = false;
                    $rootScope.loadingText = "";
                    $rootScope.loadingFlag = false;
                });
                scope.$on('$destroy', unregister);*/
                /*$rootScope.$watch("loadingFlag", function(newValue, oldvalue) {
                    //if (newValue)
                    scope.showLoadingMask(newValue);
                })

                scope.showLoadingMask = function(showHideFlag) {
                    $rootScope.loadingSpinner = showHideFlag;
                }*/
            }
        }
    }

    //Loading Mask For the Internalpage 
    function fnLoadingMaskInternal($rootScope) {
        return {
            restrict: "E",
            scope: {
                'loadingFlagInternal': '=',
                'loadingText': '@'
            },
            templateUrl: '../scripts/common/loadingMask/spinner.html',
            link: function(scope, element, attr) {

                scope.$watch("loadingFlagInternal", function(newValue, oldvalue) {
                    if (newValue)
                        scope.showLoadingMask(newValue);
                })

                scope.showLoadingMask = function(showHideFlag) {
                    scope.loadingSpinner = showHideFlag;
                }

            }
        }
    }

})();
