require.config({ baseUrl: 'js/lib',
    paths: { templates:'../tpl', data: '../data', jquery: 'jquery-1.10.2.min', sfapp: '../../sfapp' },
    shim: { "underscore-min": { exports: '_' },"json2": {exports:"JSON"}, "knockout-2.3.0": { deps: ["json2"], exports: "ko"} }
});

require(['jquery', 'json2', 'knockout-2.3.0', 'underscore-min', 'data/typeaheads',
        'modernizr.min', 'sfapp/js/bootstrap.min', 'sfapp/js/sfapp'],
function($, JSON, ko, _, typeaheads) {
    var committee_names, candidate_names, data_uri, subject_selector, candidate_check_selector;

// http://politicaladsleuth.com/political-files/2e5fd270-d28f-409a-9f68-b2d58e31c290/
    var exampleData = {
        "stationCallsign": "WRAL-TV",
        "purchaseApproved": true,
        "contractAmount": 60035.00,
        "advertiserName": "Greer Margolis & Mitchell",
        "advertiserContactName": "Jester, Daniel",
        "advertiserContactAddress": "1010 Wisconsin Avenue,\nSuite 800\nWashington,DC 20007",
        "advertiserContactPhone": "000-555-1010",
        "advertisementSubject": "Candidate",
        "isByCandidate": true,
        "subjectName": "OBAMA, BARACK",
        "subjectOfficeSought": "President of the United States",
        "committeeName": "OBAMA FOR AMERICA",
        "committeeTreasurer": "Nesbit, Martin",
        "purchases": [
            {
                "startDate": "10/9/12",
                "endDate": "10/12/12",
                "beginTime": "1:00pm",
                "endTime": "1:30pm",
                "adRate": 825.00
            },
            {
                "startDate": "10/9/12",
                "endDate": "10/12/12",
                "beginTime": "10:00am,",
                "endTime": "11:300am",
                "adRate": 500.00
            },
            {
                "startDate": "10/9/12",
                "endDate": "10/12/12",
                "beginTime": "11:35pm,",
                "endTime": "12:37am",
                "adRate": 230.00
            },
            {
                "startDate": "10/9/12",
                "endDate": "10/12/12",
                "beginTime": "11:00am,",
                "endTime": "12:00pm",
                "adRate": 5625.00
            },
            {
                "startDate": "10/9/12",
                "endDate": "10/12/12",
                "beginTime": "12:37am,",
                "endTime": "1:37am",
                "adRate": 105.00
            },
            {
                "startDate": "10/9/12",
                "endDate": "10/12/12",
                "beginTime": "12:00pm,",
                "endTime": "1:00pm",
                "adRate": 625.00
            },
            {
                "startDate": "10/9/12",
                "endDate": "10/12/12",
                "beginTime": "1:30pm",
                "endTime": "4:00pm",
                "adRate": 405.00
            },
            {
                "startDate": "10/9/12",
                "endDate": "10/12/12",
                "beginTime": "4:00pm",
                "endTime": "5:00pm",
                "adRate": 2520.00
            }
        ]
    };

    var PurchaseModel = function()
    {
        var self = this;
        self.startDate = ko.observable(null);
        self.endDate = ko.observable(null);
        self.beginTime = ko.observable(null);
        self.endTime = ko.observable(null);
        self.adRate = ko.observable(null);
    }

    function FormViewModel() {
        var self = this;
        self.stationCallsign = ko.observable();
        self.purchaseApproved = ko.observable(true);
        self.contractAmount = ko.observable();
        self.advertiserName = ko.observable();
        self.advertiserContactName = ko.observable();
        self.advertiserContactAddress = ko.observable();
        self.advertiserContactPhone = ko.observable();
        self.advertisementSubjectOptions = ko.observableArray(['Candidate', 'Issue', 'Election']);
        self.advertisementSubject = ko.observable();
        self.subjectIsCandidate = function() {
            return (self.advertisementSubject() == 'Candidate');
        };
        self.isByCandidate = ko.observable();
        self.subjectFecId = ko.observable();
        self.subjectName = ko.observable();
        self.subjectOfficeSought = ko.observable();
        self.committeeName = ko.observable();
        self.committeeFecId = ko.observable();
        self.committeeTreasurer = ko.observable();
        self.purchases = ko.observableArray([new PurchaseModel()]);
        self.addPurchase = function () {
            self.purchases.push(new PurchaseModel());
        }
        self.trimForExport = function (key, value) {
            if (key == "advertisementSubjectOptions") {
                return undefined;
            }
            return value;
        }
        self.exampleJSON = function() {
            return ko.toJSON(exampleData, null, 4);
        };
        self.resetForm = function() {
            appFormView.stationCallsign(null);
            appFormView.purchaseApproved(true);
            appFormView.contractAmount(null);
            appFormView.advertiserName(null);
            appFormView.advertiserContactName(null);
            appFormView.advertiserContactAddress(null);
            appFormView.advertiserContactPhone(null);
            appFormView.advertisementSubject(null);
            appFormView.isByCandidate(null);
            appFormView.subjectFecId(null);
            appFormView.subjectName(null);
            appFormView.subjectOfficeSought(null);
            appFormView.committeeName(null);
            appFormView.committeeTreasurer(null);
            appFormView.committeeFecId(null);

            if (!Modernizr.input.placeholder) {
                var formpl = '#fcc_form [placeholder]';
                $(formpl).each(function() {
                    $(self).val( $(self).attr('placeholder') );
                });
            }
        };
        self.submitForm = function(formElement) {
            $('#form-submit-modal').modal();
        };
        self.matchCommitteeToFecId = function() {
            try {
                var fecId = typeaheads.committees[self.committeeName()];
                if (fecId != null) {
                    self.committeeFecId(fecId);
                    return self.committeeFecId;
                };
            }
            catch(e){return null;};
        };
        self.matchSubjectToFecId = function() {
            try {
                var fecId = typeaheads.candidates[self.subjectName()];
                if (fecId != null) {
                    self.subjectFecId(fecId);
                    return self.subjectFecId;
                };
            }
            catch(e){return null;};
        };
        self.anyAdvertiserInfo = function() {
            var hasAdvertiserName = !(self.advertiserName() == undefined || self.advertiserName() == '');
            var hasContactName = !(self.advertiserContactName() == undefined || self.advertiserContactName() == '');
            return (hasAdvertiserName || hasContactName);
        };
    }

    var appFormView = new FormViewModel();

    ko.applyBindings(appFormView);

    function attach_typeaheads () {
        $('input[name=station_callsign]').typeahead({
            source: typeaheads.callsigns
        });
        $('input[name=committee_name]').typeahead({
            minLength: 2,
            source: function(query, callback) {
                callback(committee_names);
            }
        });
        $('input[name=subject_name]').typeahead({
            minLength: 2,
            source: function(query, callback) {
                callback(candidate_names);
            }
        });
        $('input[name=office_sought]').typeahead({
            source: ["U.S. Senate", "U.S. House of Representatives", "President of the United States", "Governor of "]
        });
    }

    function processPlaceholders () {
        /*
            Enable placeholders on browsers without native support
        */
        if (!Modernizr.input.placeholder) {
            var formpl = '#fcc_form [placeholder]';
            $(formpl).each(function(event) {
                if ($(this).val() == '') // if field is empty
                {
                    $(this).val( $(this).attr('placeholder') );
                }
            });
            $(document).on('focus', formpl, function(event) {
                if ($(this).val() == $(this).attr('placeholder'))
                {
                    $(this).val('');
                }
            });
            $(document).on('blur', formpl, function(event) {
                if ($(this).val() == '' || $(this).val() == $(this).attr('placeholder'))
                {
                    $(this).val($(this).attr('placeholder'));
                }
            });
            $(document).on('submit', 'form', function(event) {
                $(this).find('[placeholder]').each(function()
                {
                    if ($(this).val() == $(this).attr('placeholder'))
                    {
                        $(this).val('');
                    }
                });
            });

        }
    }

    // Button for loading example data
    $(document).on('click', '#fill-approve', function(event) {
        event.preventDefault();
        appFormView.stationCallsign(exampleData.stationCallsign);
        appFormView.purchaseApproved(exampleData.purchaseApproved);
        appFormView.contractAmount(exampleData.contractAmount);
        appFormView.advertiserName(exampleData.advertiserName);
        appFormView.advertiserContactName(exampleData.advertiserContactName);
        appFormView.advertiserContactAddress(exampleData.advertiserContactAddress);
        appFormView.advertiserContactPhone(exampleData.advertiserContactPhone);
        appFormView.advertisementSubject(exampleData.advertisementSubject);
        appFormView.isByCandidate(exampleData.isByCandidate);
        appFormView.subjectFecId(exampleData.subjectFecId);
        appFormView.subjectName(exampleData.subjectName);
        appFormView.subjectOfficeSought(exampleData.subjectOfficeSought);
        appFormView.committeeName(exampleData.committeeName);
        appFormView.committeeTreasurer(exampleData.committeeTreasurer);
        appFormView.purchases(exampleData.purchases);
        $('#example-modal').modal('hide')
    });

    committee_names = _.keys(typeaheads.committees);
    candidate_names = _.keys(typeaheads.candidates);

    $(document).ready(function($) {
        attach_typeaheads();
        processPlaceholders();
    });
});

