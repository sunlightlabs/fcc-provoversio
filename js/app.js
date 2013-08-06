require.config({ baseUrl: 'js/lib',
    paths: { templates:'../tpl', data: '../data', jquery: 'jquery-1.10.2.min', sfapp: '../../sfapp' },
    shim: { "underscore-min": { exports: '_' } }
});

require(['jquery', 'underscore-min', 'text', 'handlebars',
        'text!templates/form.handlebars','text!templates/payload.xml.handlebars', 'data/typeaheads',
        'modernizr.min', 'sfapp/js/bootstrap.min', 'sfapp/js/sfapp'],
function($, _, text, handlebars, form_src, xml_src, typeaheads) {
    var fec_names, form_tpl, xml_tpl,
    data_uri, subject_selector, candidate_check_selector;

    subject_selector = 'select[name=advertisement_subject]';
    candidate_check_selector = 'input[name=by_candidate]';
    // Data and tpl setup
    data_uri = 'js/data/example_data.json';
    form_tpl = Handlebars.compile(form_src);
    xml_tpl = Handlebars.compile(xml_src);

    function trigger_form_changes () {
        $(subject_selector).change();
        $(candidate_check_selector).change();
    }

    function attach_typeaheads () {
        $('input[name=station_callsign]').typeahead({
            source: typeaheads.callsigns
        });

        $('input[name=committee_name]').typeahead({
            minLength: 2,
            source: function(query, callback) {
                callback(fec_names);
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

    $(document).ready(function($) {
        // Display form
        $('#app-form').html(form_tpl);
        trigger_form_changes();
        attach_typeaheads();
        processPlaceholders();
        fec_names = _.keys(typeaheads.fec);

        // Button for loading example data
        $(document).on('click', '#load_eg', function(event) {
            event.preventDefault();
            $('#app-form').fadeOut('slow', function() {
                $.getJSON(data_uri, function(json, textStatus, jqXHR) {
                    var compiled = form_tpl(json);
                    $('#app-form').html(compiled);
                    $('#app-form').fadeIn('slow', function() {
                        $('#advertisement_subject option').filter('[value='+ json.advertisement.subject + ']').prop('selected', true);
                        trigger_form_changes();
                        attach_typeaheads();
                        processPlaceholders();
                    });
                    var comp_xml = xml_tpl(json);
                    var pre = $('<pre>');
                    pre.html(comp_xml);
                    $('#app-data').html(pre);
                });

            });
        });

        /*
            form#fcc_form Events
        */
        $(document).on('change', subject_selector, function(evt) {
            var field_val = $(this).val();
            var el = $("#form_candidate_extras");
            var inputs = el.find('input').not('[type="checkbox"]');
            if (field_val == 'candidate') {
                inputs.attr('required', 'required');
                el.show();
            }
            else {
                inputs.removeAttr('required');
                el.hide();
            }
        });
        $(document).on('change', candidate_check_selector, function(evt) {
            var checked = $(this).prop("checked");
            var el = $("#form_committee_details");
            var inputs = el.find('input').not('[type="checkbox"]');
            if (checked === true) {
                inputs.attr('required', 'required');
                el.show();
            }
            else {
                inputs.removeAttr('required');
                el.hide();
            }
        });

        $(document).on('submit', '#fcc_form', function(event) {
            event.preventDefault();
            console.log("Submit form");
        });

        $(document).on('click', '#fakereset', function(event) {
            event.preventDefault();
            $('#app-form').fadeOut('fast', function() {
                // var compiled = form_tpl();
                $('#app-form').html(form_tpl);
                $('#app-form').fadeIn('fast', function() {
                    trigger_form_changes();
                    attach_typeaheads();
                    processPlaceholders();
                });
            });
        });


    });
});

