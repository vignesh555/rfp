(function() {
    angular.module("rfpApp").service('fileUpload', ['$http', '$q', function($http, $q) {
        this.uploadFileToUrl = function(file, uploadUrl) {
            var deferred = $q.defer();
            var fd = new FormData();
            fd.append('file', file);

            $http.post(uploadUrl, fd, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                })
                .success(function(data) {
                    deferred.resolve(data);
                })
                .error(function(err) {
                    deferred.reject(err);
                });
            return deferred.promise;
        }
    }]);
})();
