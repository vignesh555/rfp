(function() {
    angular.module("rfpApp").controller("bulkInsertController", bulkInsertControllerFn);

    bulkInsertControllerFn.$inject = ['$scope', 'fileUpload', '$rootScope'];

    function bulkInsertControllerFn($scope, fileUpload, $rootScope) {
        $scope.uploadFile = function() {
            var file = $scope.myFile;

            if (file) {
                var uploadUrl = "/fileUpload";
                if ($scope.checkValidFile(file.name)) {
                    $rootScope.loadingText = "Please Wait Bulk Insert In Process";
                    $rootScope.loadingFlag = true;
                    var fileUploadPromise = fileUpload.uploadFileToUrl(file, uploadUrl);
                    fileUploadPromise.then(function(data) {
                        $scope.clearLoadingImage();
                        $scope.alerts = [
                            { 'type': 'success', 'msg': "SuccessFully Saved" }
                        ];
                    }, function(reason) {
                        $scope.clearLoadingImage();
                        $scope.alerts = [
                            { 'type': 'error', 'msg': 'Something happened try again' }
                        ];
                    });
                } else {
                    $scope.alerts = [
                        { 'type': 'warning', 'msg': 'Only xlsx format Supports' }
                    ];
                }
            } else {
                $scope.alerts = [
                    { 'type': 'warning', 'msg': 'Upload a file' }
                ];
            }
            /*var uploadUrl = "/fileUpload";
            fileUpload.uploadFileToUrl(file, uploadUrl);*/
        };

        $scope.clearLoadingImage = function() {
            $rootScope.loadingText = "";
            $rootScope.loadingFlag = false;
        }
        $scope.clearLoadingImage();

        $scope.checkValidFile = function(fileName) {
            var extensionArray = fileName.split(".");
            if (extensionArray[1] === "xlsx") {
                return true;
            }
            return false;
        }

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    };
})();
