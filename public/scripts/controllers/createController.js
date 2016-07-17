(function() {
    angular.module("rfpApp").controller("createController", createControllerFn);


    createControllerFn.$inject = ['$scope', 'shareService', '$rootScope'];


    function createControllerFn(scope, shareService, $rootScope) {
        scope.submit = function() {
            // Set the 'submitted' flag to true
            scope.submitted = true;
            var data = angular.copy(scope.form),
                dateRange = {};

            console.log(data, scope.rfpForm.$valid);

            if (scope.rfpForm.$valid) {
                $rootScope.loadingText = "Please wait We are saving your data";
                $rootScope.loadingFlag = true;

                data.rfpStartDate = moment(JSON.parse(angular.toJson(data.rfpDate.startDate))).format("DD/MM/YYYY");
                data.rfpEndDate = moment(JSON.parse(angular.toJson(data.rfpDate.endDate))).format("DD/MM/YYYY");
                delete data.rfpDate;

                shareService.save(data, function(resp, headers) {
                        scope.resetForm();
                        scope.clearLoadingImage();
                        scope.alerts = [{
                            'type': 'success',
                            'msg': resp.status
                        }];
                    },
                    function(err) {
                        console.log(err);
                    });
            }
        };

        scope.closeAlert = function(index) {
            scope.alerts.splice(index, 1);
        };


        scope.resetForm = function() {
            /*scope.form.rfpDate.startDate = "";
            scope.form.rfpDate.endDate = "";
            scope.form = {};*/
            scope.resetFormFields();
            scope.rfpForm.$setPristine();
            scope.rfpForm.$setUntouched();
            scope.submitted = false;
        };

        scope.resetFormFields = function() {
            scope.form.rfpClientName = "";
            scope.form.rfpEngagementType = "";
            scope.form.rfpLocation = "";
            scope.form.rfpName = "";
            scope.form.rfpPocId = "";
            scope.form.rfpPocName = "";
            scope.form.rfpStatus = "";
            scope.form.rfpTechStack = "";
            scope.form.rfpVertical = "";
            /*scope.form.rfpDate = {
                startDate: null,
                endDate: null
            };*/
        };

        scope.clearLoadingImage = function() {
            $rootScope.loadingText = "";
            $rootScope.loadingFlag = false;
        };
        scope.clearLoadingImage();

    }


})();
