(function() {
    angular.module("rfpApp").controller("gridController", ['$scope', '$compile', 'shareService', '$rootScope', function($scope, $compile, shareService, $rootScope) {
        $rootScope.loadingText = "List is loading";
        $rootScope.loadingFlag = true;

        var columnDefs = [
            //{ headerName: "S.No", field: "sno", width: 50, filter: CustomFilter },
            { headerName: "_id", field: "_id", filter: CustomFilter, hide: true },
            { headerName: "Date", field: "rfpDate", width: 100, filter: CustomFilter },
            { headerName: "RFP Name", field: "rfpName", width: 100, filter: CustomFilter },
            { headerName: "Client Name", field: "rfpClientName", width: 100, filter: CustomFilter },
            { headerName: "Tech Stach", field: "rfpTechStack", width: 100, filter: CustomFilter },
            { headerName: "Vertical", field: "rfpVertical", width: 100 },
            { headerName: "Location", field: "rfpLocation", width: 100 },
            { headerName: "POC Name", field: "rfpPocName", width: 100, filter: CustomFilter },
            { headerName: "POC ID", field: "rfpPocId", width: 100, filter: CustomFilter }, {
                headerName: "Status",
                field: "rfpStatus",
                width: 100,
                template: '<span class="status-holder" ng-class="data.rfpStatus" ng-bind="data.rfpStatus | uppercase"></span>'
            },
        ];
        $scope.gridOptions = {
            columnDefs: columnDefs,
            enableFilter: true,
            angularCompileRows: true,
            enableSorting: true,
            enableColResize: true,
            rowHeight: 37
        };

        $scope.onFilterChanged = function(value) {
            $scope.gridOptions.api.setQuickFilter(value);
        };

        $scope.onBtExport = function() {
            $scope.gridOptions.api.exportDataAsCsv();
        }

        $scope.printContent = function(el) {
            document.body.classList.add("print-body");
            window.print();
            document.body.classList.remove("print-body");
        }

        function dateValueHandler(params) {
            var value = params.newValue;
            console.log(value);
            alert(value.match(/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/))
            if (value.match(/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))))$/)) {
                alert("Valid Date")
            } else {
                alert("invalid date")
            }
        }

        function emptyValueHandler(params) {
            var value = params.newValue;
            if (value == '') {
                alert("Please enter data.")
            }
        }



        function CustomFilter() {}

        //Defining custom ilter to filter column data.
        CustomFilter.prototype.init = function(params) {
            this.valueGetter = params.valueGetter;
            this.filterText = null;
            this.setupGui(params);
        };

        // not called by ag-Grid, just for us to help setup
        CustomFilter.prototype.setupGui = function(params) {
            this.gui = document.createElement('div');
            this.gui.innerHTML =
                '<div style="padding: 4px; width: 200px;">' +
                '<div><input style="margin: 4px 0px 4px 0px;" type="text" id="filterText" placeholder="Search..."/></div>';

            this.eFilterText = this.gui.querySelector('#filterText');
            this.eFilterText.addEventListener("changed", listener);
            this.eFilterText.addEventListener("paste", listener);
            this.eFilterText.addEventListener("input", listener);
            // IE doesn't fire changed for special keys (eg delete, backspace), so need to
            // listen for this further ones
            this.eFilterText.addEventListener("keydown", listener);
            this.eFilterText.addEventListener("keyup", listener);

            var that = this;

            function listener(event) {
                that.filterText = event.target.value;
                params.filterChangedCallback();
            }
        };

        CustomFilter.prototype.getGui = function() {
            return this.gui;
        };

        CustomFilter.prototype.doesFilterPass = function(params) {
            // make sure each word passes separately, ie search for firstname, lastname
            var passed = true;
            var valueGetter = this.valueGetter;
            this.filterText.toLowerCase().split(" ").forEach(function(filterWord) {
                var value = valueGetter(params);
                if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                    passed = false;
                }
            });

            return passed;
        };

        CustomFilter.prototype.isFilterActive = function() {
            return this.filterText !== null && this.filterText !== undefined && this.filterText !== '';
        };

        CustomFilter.prototype.getApi = function() {
            var that = this;
            return {
                getModel: function() {
                    var model = { value: that.filterText.value };
                    return model;
                },
                setModel: function(model) {
                    that.eFilterText.value = model.value;
                }
            };
        };

        var setSelectionOptions = ["Submitted", "Drop off", "In Progress", "On Hold", "Not in our scope"];

        function customEditor(params) {

            var editing = false,
                eCell = document.createElement('div'),
                eLabel = document.createTextNode(params.value),
                editTemplate = '<span class="status-holder" ng-class="data.status_code" ng-bind="data.status | uppercase"></span>';

            eCell.innerHTML = editTemplate;
            eCell.className = "status-wrapper"
            var eSelect = document.createElement("select");
            eSelect.className = "edit-select";

            setSelectionOptions.forEach(function(item) {
                var eOption = document.createElement("option");
                eOption.setAttribute("value", item);
                eOption.innerHTML = item;
                eSelect.appendChild(eOption);
            });
            eSelect.value = params.value;

            eCell.addEventListener('click', function() {
                if (!editing) {
                    eCell.removeChild(eCell.getElementsByClassName("status-holder")[0]);
                    eCell.appendChild(eSelect);
                    eSelect.focus();
                    editing = true;
                }
            });

            eSelect.addEventListener('blur', function() {
                if (editing) {
                    editing = false;
                    eCell.removeChild(eSelect);
                    eCell.innerHTML = editTemplate;
                    eCell.innerHTML = "<span class='status-holder'>" + params.value + "</span>";
                    eCell.getElementsByClassName("status-holder")[0].classList.add(params.value);
                }
            });

            eSelect.addEventListener('change', function() {
                if (editing) {
                    editing = false;
                    var newValue = eSelect.value;
                    params.data[params.colDef.field] = newValue;
                    params.$scope.data[params.colDef.field] = newValue;
                    eCell.removeChild(eSelect);
                    eCell.innerHTML = "<span class='status-holder'>" + newValue + "</span>";
                    eCell.getElementsByClassName("status-holder")[0].classList.add(newValue);
                }
            });

            return eCell;
        }

        function dateEditor(params) {

            var editing = false,
                inputEditor = null,
                eCell = document.createElement('div'),
                eLabel = document.createTextNode(params.value),
                editTemplate = '<div class="date-pick-holder"><input type="text" class="date-pick" is-open="opened" tux-datepicker-popup="dd/mm/yyyy" datepicker-append-to-body=true ng-model="data.value"/></div>';

            eCell.appendChild(eLabel);
            params.$scope.opened = true;
            eCell.addEventListener('click', function() {
                if (!editing) {
                    eCell.removeChild(eLabel);
                    eCell.appendChild($compile(editTemplate)(params.$scope)[0]);
                    inputEditor = eCell.getElementsByClassName("date-pick")[0];
                    inputEditor.focus();
                    editing = true;
                }
                inputEditor.addEventListener('change', function() {
                    if (editing) {
                        editing = false;
                        newValue = inputEditor.value;
                        params.data[params.colDef.field] = newValue;
                        eCell.removeChild(eCell.getElementsByClassName("date-pick-holder")[0]);
                        eCell.appendChild(eLabel);
                    }
                });
            });



            return eCell;
        }


        //  $scope.gridOptions1 = angular.copy($scope.gridOptions);

        //Enable cell editing for grid.
        angular.forEach($scope.gridOptions.columnDefs, function(obj) {
            switch (obj.field) {
                case "status":
                    delete obj.template;
                    obj.cellRenderer = customEditor;
                    break;
                case "editable":
                    obj.editable = false;
                    break;
                    // case "lastUpdateDate":
                    //     delete obj.template;
                    //     obj.cellRenderer = dateEditor;
                    //     break;
                default:
                    obj.editable = true;
            }
        });
        $scope.gridOptions2 = angular.copy($scope.gridOptions);
        $scope.gridOptions2.rowModelType = 'pagination';
        $scope.gridOptions2.onGridReady = function() {
            $scope.gridOptions.api.setDatasource({
                pageSize: 10,
                getRows: function(params) {
                    setTimeout(function() {
                        var rowsThisPage = $scope.gridOptions.rowData.slice(params.startRow, params.endRow);
                        var lastRow = -1;
                        if ($scope.gridOptions.rowData.length <= params.endRow) {
                            lastRow = $scope.gridOptions.rowData.length;
                        }
                        params.successCallback(rowsThisPage, lastRow);
                    }, 500);
                },
                rowCount: 28

            });
        };

        //Enable row selection for grid.
        $scope.gridOptions2.columnDefs[0].checkboxSelection = true;
        $scope.gridOptions2.rowSelection = "multiple";
        $scope.gridOptions2.rowDeselection = true;
        $scope.gridOptions3 = angular.copy($scope.gridOptions);
        $scope.gridOptions3.columnDefs[0].pinned = 'left';

        $scope.getRFPData = function() {
            shareService.query({}, function(resp, headers) {
                    //resp = toGenerateSerialNumber(resp);
                    $scope.gridOptions.api.setRowData(resp);
                    $scope.rowDataLength = resp.length;
                    $rootScope.loadingFlag = false;
                },
                function(err) {
                    console.log(err);
                });
        }

        function toGenerateSerialNumber(collectionList) {
            collectionList.forEach(function(value, index) {
                value.status = value.rfpStatus === "Submitted" ? "Done" : value.status;
                value.sno = index + 1;
            });
            return collectionList;
        };


        $scope.getRFPData();

    }]);
})();
