require.config({ baseUrl: 'js/lib',
    paths: { templates:'../tpl', data: '../data', jquery: 'jquery-1.10.2.min', sfapp: '../../sfapp' },
    shim: { "underscore-min": { exports: '_' }, "json2": {exports:"JSON"}, "knockout-2.3.0": { deps: ["json2"], exports: "ko"},
            "sfapp/js/bootstrap.min": ["jquery"], "sfapp/js/sfapp": ["jquery",  "sfapp/js/bootstrap.min"] }
});

require(['jquery', 'json2', 'knockout-2.3.0', 'underscore-min', 'data/typeaheads',
        'modernizr.min', 'sfapp/js/bootstrap.min', 'sfapp/js/sfapp'],
function($, JSON, ko, _, typeaheads) {
    var committee_names, candidate_names, data_uri, subject_selector, candidate_check_selector;

// http://politicaladsleuth.com/political-files/d048f5d0-ee8e-4e29-a49b-1ea97487dd4c/
    var exampleData = {
        "contractNumber": "8533",
        "stationCallsign": "WABC-TV",
        "purchaseApproved": true,
        "contractAmount": 8900.00,
        "commissionedByCandidateOrCommittee": true,
        "commissionerCandidate": "PALLONE, FRANK JR",
        "commissionerCommittee": "PALLONE FOR SENATE",
        "commissionerContactAddress": "",
        "commissionerContactPhone": "000-555-1010",
        "refersToCandidate": true,
        "subjectName": "PALLONE, FRANK JR",
        "subjectOfficeSought": "U.S. Senate",
        "commissionedBy": "PALLONE FOR SENATE",
        "committeeTreasurer": "Nichols, Peter D.",
        "purchases": [
            {
                "startDate": "8/12/13",
                "endDate": "8/12/13",
                "beginTime": "6:15am",
                "endTime": "7:00am",
                "adRate": 1400.00,
                "numberSpots": 1,
                "timeClass": null
            },
            {
                "startDate": "8/12/13",
                "endDate": "8/12/13",
                "beginTime": "7:00am",
                "endTime": "9:00am",
                "adRate": 2000.00,
                "numberSpots": 2,
                "timeClass": null
            },
            {
                "startDate": "8/12/13",
                "endDate": "8/12/13",
                "beginTime": "11:15pm",
                "endTime": "11:35pm",
                "adRate": 3500.00,
                "numberSpots": 1,
                "timeClass": null
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
        self.numberSpots = ko.observable();
        self.timeClass = ko.observable();
    }

    function FormViewModel() {
        var self = this;
        self.stationCallsign = ko.observable();
        self.purchaseApproved = ko.observable(true);
        self.contractAmount = ko.observable();
        self.commissionedByCandidateOrCommittee = ko.observable(false);
        self.commissionerCandidate = ko.observable();
        self.commissionerCommittee = ko.observable();
        self.committeeTreasurer = ko.observable();
        self.commissionedBy = ko.observable();
        self.commissionerContactAddress = ko.observable();
        self.commissionerContactPhone = ko.observable();
        self.advertisementSubjectOptions = ko.observableArray(['Candidate', 'Issue', 'Election']);
        self.advertisementSubject = ko.observable();
        self.refersToCandidate = ko.observable(false);
        self.subjectFecId = ko.observable();
        self.subjectName = ko.observable();
        self.subjectOfficeSought = ko.observable();
        self.commissionedBy = ko.observable();
        self.committeeFecId = ko.observable();
        self.principals = ko.observable();
        self.principalsList = ko.computed(function() {
            var raw_input = self.principals();
            if (raw_input == undefined) {
                return undefined;
            };
            var list = raw_input.split('\n');
            return list;
        });
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
        self.loadExampleData = function() {
            self.stationCallsign(exampleData.stationCallsign);
            self.purchaseApproved(exampleData.purchaseApproved);
            self.contractAmount(exampleData.contractAmount);
            self.commissionedByCandidateOrCommittee(exampleData.commissionedByCandidateOrCommittee);
            self.commissionerCandidate(exampleData.commissionerCandidate);
            self.commissionerCommittee(exampleData.commissionerCommittee);
            self.committeeTreasurer(exampleData.committeeTreasurer);
            self.commissionedBy(exampleData.commissionedBy);
            self.commissionerContactAddress(exampleData.commissionerContactAddress);
            self.commissionerContactPhone(exampleData.commissionerContactPhone);
            self.advertisementSubject(exampleData.advertisementSubject);
            self.refersToCandidate(exampleData.refersToCandidate);
            self.subjectFecId(exampleData.subjectFecId);
            self.subjectName(exampleData.subjectName);
            self.subjectOfficeSought(exampleData.subjectOfficeSought);
            self.commissionedBy(exampleData.commissionedBy);
            self.purchases(exampleData.purchases);
        };
        self.resetForm = function() {
            self.stationCallsign(null);
            self.purchaseApproved(true);
            self.contractAmount(null);
            self.commissionedByCandidateOrCommittee(false);
            self.commissionedBy(null);
            self.commissionerContactAddress(null);
            self.commissionerContactPhone(null);
            self.commissionerCandidate(null);
            self.commissionerCommittee(null);
            self.advertisementSubject(null);
            self.refersToCandidate(false);
            self.subjectFecId(null);
            self.subjectName(null);
            self.subjectOfficeSought(null);
            self.commissionedBy(null);
            self.committeeTreasurer(null);
            self.purchases([new PurchaseModel()]);

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
                var fecId = typeaheads.committees[self.commissionedBy()];
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
    }

    var appFormView = new FormViewModel();

    ko.applyBindings(appFormView);

    function attach_typeaheads () {
        $('input[name=station_callsign]').typeahead({
            source: typeaheads.callsigns
        });
        $('input[name=commissionerCommittee],input[name=commissionedBy]').typeahead({
            minLength: 2,
            source: function(query, callback) {
                callback(committee_names);
            }
        });
        $('input[name=subjectName],input[name=commissionerCandidate]').typeahead({
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

    committee_names = _.keys(typeaheads.committees);
    candidate_names = _.keys(typeaheads.candidates);

    $(document).ready(function($) {
        attach_typeaheads();
        processPlaceholders();
    });
});

