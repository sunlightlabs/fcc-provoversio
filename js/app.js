require.config({ baseUrl: 'js/lib',
    paths: { templates:'../tpl', data: '../data', jquery: 'jquery-1.10.2.min', sfapp: '../../sfapp' },
    shim: { "underscore-min": { exports: '_' } }
});

require(['jquery', 'json2', 'knockout-2.3.0', 'underscore-min', 'data/typeaheads',
        'modernizr.min', 'sfapp/js/bootstrap.min', 'sfapp/js/sfapp'],
function($, JSON, ko, _, typeaheads) {
    var committee_names, candidate_names, data_uri, subject_selector, candidate_check_selector;

    var exampleData = {
        "stationCallsign": "WRAL-TV",
        "purchaseApproved": true,
        "contractAmount": 33000.00,
        "advertiserName": "Something, Inc",
        "advertiserContactName": "Johnny Rotten",
        "advertiserContactAddress": "1212 N Street NW,\nSuite 1999\nWashington,DC 20009",
        "advertiserContactPhone": "555-333-0000",
        "advertisementSubject": "Candidate",
        "isByCandidate": true,
        "subjectName": "KWARG",
        "subjectOfficeSought": "Best Person",
        "committeeName": "AMERICAN CROSSROADS", // "C00487363"
        "committeeTreasurer": "Sally Sue"
    };

    function FormViewModel() {
        this.exampleData =
        this.stationCallsign = ko.observable();
        this.purchaseApproved = ko.observable(true);
        this.contractAmount = ko.observable();
        this.advertiserName = ko.observable();
        this.advertiserContactName = ko.observable();
        this.advertiserContactAddress = ko.observable();
        this.advertiserContactPhone = ko.observable();
        this.advertisementSubjectOptions = ko.observableArray(['Candidate', 'Issue', 'Election']);
        this.advertisementSubject = ko.observable();
        this.subjectIsCandidate = function() {
            return (this.advertisementSubject() == 'Candidate');
        };
        this.isByCandidate = ko.observable();
        this.subjectFecId = ko.observable();
        this.subjectName = ko.observable();
        this.subjectOfficeSought = ko.observable();
        this.committeeName = ko.observable();
        this.committeeFecId = ko.observable();
        this.committeeTreasurer = ko.observable();
        this.trimForExport = function (key, value) {
            if (key == "advertisementSubjectOptions") {
                return undefined;
            }
            return value;
        }
        this.exampleJSON = function() {
            return ko.toJSON(exampleData, null, 4);
        };
        this.resetForm = function() {
            this.advertiserContactAddress('');
            return true;
        };
        this.submitForm = function(formElement) {
            // console.log("Submit form");
            $('#form-submit-modal').modal();
        };
        this.matchCommitteeToFecId = function() {
            try {
                var fecId = typeaheads.committees[this.committeeName()];
                if (fecId != null) {
                    this.committeeFecId = fecId;
                    return this.committeeFecId;
                };
            }
            catch(e){return null;};
        };
        this.matchSubjectToFecId = function() {
            try {
                var fecId = typeaheads.candidates[this.subjectName()];
                if (fecId != null) {
                    this.subjectFecId = fecId;
                    return this.subjectFecId;
                };
            }
            catch(e){return null;};
        };
        this.anyAdvertiserInfo = function() {
            var hasAdvertiserName = !(this.advertiserName() == undefined || this.advertiserName() == '');
            var hasContactName = !(this.advertiserContactName() == undefined || this.advertiserContactName() == '');
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
                if ($(this).val() === '') // if field is empty
                {
                    $(this).addClass('muted');
                    $(this).val( $(this).attr('placeholder') );
                }
                else {
                    $(this).removeClass('muted');
                }
            });
            $(document).on('focus', formpl, function(event) {
                event.preventDefault();
                if ($(this).val() == $(this).attr('placeholder'))
                {
                    $(this).val('');
                    $(this).removeClass('muted');
                }
            });
            $(document).on('blur', formpl, function(event) {
                event.preventDefault();
                if ($(this).val() === '' || $(this).val() == $(this).attr('placeholder'))
                {
                    $(this).addClass('muted');
                    $(this).val($(this).attr('placeholder'));
                }
                else {
                    $(this).removeClass('muted');
                }
            });
            $(document).on('submit', 'form', function(event) {
                event.preventDefault();
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
        $('#example-modal').modal('hide')
    });

    committee_names = _.keys(typeaheads.committees);
    candidate_names = _.keys(typeaheads.candidates);

    $(document).ready(function($) {
        // Display form
        attach_typeaheads();
        processPlaceholders();
    });
});

