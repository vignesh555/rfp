(function() {
    angular.module("rfpApp").controller("createController", createControllerFn);


    createControllerFn.$inject = ['$scope', 'shareService', '$rootScope'];


    function createControllerFn(scope, shareService, $rootScope) {
        scope.submit = function() {
            // Set the 'submitted' flag to true
            scope.submitted = true;
            var data = scope.form;
            console.log(data, scope.rfpForm.$valid);

            if (scope.rfpForm.$valid) {
                $rootScope.loadingText = "Please wait We are saving your data";
                $rootScope.loadingFlag = true;
                shareService.save(data, function(resp, headers) {
                        scope.resetForm();
                        scope.clearLoadingImage();
                        scope.alerts = [
                            { 'type': 'success', 'msg': resp.status }
                        ];
                    },
                    function(err) {
                        console.log(err);
                    });
            }
        }



        /*scope.alerts = [
            { 'type': 'success', 'msg': 'Success Confirmation Message' }
        ];*/

        scope.closeAlert = function(index) {
            scope.alerts.splice(index, 1);
        };


        scope.resetForm = function() {
            scope.form = {};
            scope.rfpForm.$setPristine();
            scope.rfpForm.$setUntouched();
            scope.submitted = false;
        };

        scope.clearLoadingImage = function() {
            $rootScope.loadingText = "";
            $rootScope.loadingFlag = false;
        }
        scope.clearLoadingImage();

    };


})();
